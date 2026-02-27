import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { legacy_user_id, message, conversation_id, visitor_name, generate_audio } = await req.json();
    if (!legacy_user_id) throw new Error('legacy_user_id is required');
    if (!message) throw new Error('message is required');

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Step 1: Load personality model
    const { data: personality, error: personalityError } = await supabase
      .from('personality_profiles')
      .select('*')
      .eq('user_id', legacy_user_id)
      .single();

    if (personalityError || !personality) {
      throw new Error('No personality model found for this person. They need more responses first.');
    }

    // Step 2: Load the person's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, bio')
      .eq('id', legacy_user_id)
      .single();

    const personName = profile?.display_name || 'this person';

    // Step 3: Retrieve relevant responses (RAG - semantic retrieval via AI)
    // Fetch all responses with transcripts for context selection
    const { data: allResponses } = await supabase
      .from('responses')
      .select('content, transcript, summary, extracted_values, extracted_emotions, content_type, questions(question, category)')
      .eq('user_id', legacy_user_id)
      .not('summary', 'is', null)
      .order('created_at', { ascending: true });

    // Build context from responses - use AI to select most relevant ones
    let relevantContext = '';
    
    if (allResponses && allResponses.length > 0) {
      // If we have few enough responses, include all of them
      if (allResponses.length <= 15) {
        relevantContext = allResponses.map((r, i) => {
          const text = r.transcript || r.content;
          const q = r.questions?.question || '';
          return `[Memory ${i + 1}] Q: "${q}" → "${text}"`;
        }).join('\n\n');
      } else {
        // For many responses, use AI to select the most relevant ones
        const summaryList = allResponses.map((r, i) => 
          `${i}: [${r.questions?.category || 'general'}] "${r.summary}" (values: ${r.extracted_values?.join(', ') || 'none'})`
        ).join('\n');

        const selectionResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: 'Select the 8-10 most relevant response indices for answering the user\'s question. Return only comma-separated numbers.' },
              { role: 'user', content: `Question being asked: "${message}"\n\nAvailable memories:\n${summaryList}` }
            ],
          }),
        });

        if (selectionResponse.ok) {
          const selectionResult = await selectionResponse.json();
          const selectedText = selectionResult.choices?.[0]?.message?.content || '';
          const indices = selectedText.match(/\d+/g)?.map(Number).filter(n => n < allResponses.length) || [];
          
          const selectedResponses = indices.length > 0 
            ? indices.map(i => allResponses[i]).filter(Boolean)
            : allResponses.slice(0, 10);

          relevantContext = selectedResponses.map((r, i) => {
            const text = r.transcript || r.content;
            const q = r.questions?.question || '';
            return `[Memory ${i + 1}] Q: "${q}" → "${text}"`;
          }).join('\n\n');
        } else {
          await selectionResponse.text(); // consume body
          // Fallback: use first 10 responses
          relevantContext = allResponses.slice(0, 10).map((r, i) => {
            const text = r.transcript || r.content;
            return `[Memory ${i + 1}] "${text}"`;
          }).join('\n\n');
        }
      }
    }

    // Step 4: Load conversation history
    let conversationHistory: Array<{ role: string; content: string }> = [];
    let activeConversationId = conversation_id;

    if (activeConversationId) {
      const { data: messages } = await supabase
        .from('ai_messages')
        .select('role, content')
        .eq('conversation_id', activeConversationId)
        .order('created_at', { ascending: true })
        .limit(20);

      if (messages) {
        conversationHistory = messages.map(m => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content
        }));
      }
    }

    // Step 5: Generate response using personality model
    const systemPrompt = personality.system_prompt || buildFallbackPrompt(personName, personality);

    const fullSystemPrompt = `${systemPrompt}

IMPORTANT RULES:
- You ARE ${personName}. Respond in first person as them.
- Draw on your actual memories and experiences provided below. Reference them naturally.
- If you haven't directly experienced what's being asked about, reason from what you HAVE experienced.
- Never break character. Never say "As an AI" or similar.
- Be honest about what you don't know or haven't experienced.
- Use your natural speaking patterns and emotional style.
${visitor_name ? `- You are speaking with ${visitor_name}.` : ''}

YOUR MEMORIES AND EXPERIENCES:
${relevantContext || 'No specific memories loaded yet.'}`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: fullSystemPrompt },
          ...conversationHistory,
          { role: 'user', content: message }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error('AI chat error:', aiResponse.status, errText);
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'AI usage limit reached' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      throw new Error(`AI response failed: ${aiResponse.status}`);
    }

    const aiResult = await aiResponse.json();
    const responseText = aiResult.choices?.[0]?.message?.content || '';

    if (!responseText) throw new Error('Empty AI response');

    // Step 6: Create or update conversation record
    if (!activeConversationId) {
      const { data: newConv, error: convError } = await supabase
        .from('ai_conversations')
        .insert({
          legacy_user_id,
          visitor_name: visitor_name || null,
          message_count: 0,
        })
        .select('id')
        .single();

      if (convError) {
        console.error('Failed to create conversation:', convError);
      } else {
        activeConversationId = newConv.id;
      }
    }

    // Save messages
    if (activeConversationId) {
      await supabase.from('ai_messages').insert([
        { conversation_id: activeConversationId, role: 'user', content: message },
        { conversation_id: activeConversationId, role: 'assistant', content: responseText }
      ]);

      await supabase
        .from('ai_conversations')
        .update({ message_count: conversationHistory.length + 2 })
        .eq('id', activeConversationId);
    }

    // Step 7: Optionally generate audio using voice clone
    let audioContent = null;
    if (generate_audio) {
      const { data: voiceProfile } = await supabase
        .from('voice_profiles')
        .select('elevenlabs_voice_id')
        .eq('user_id', legacy_user_id)
        .eq('is_primary', true)
        .single();

      if (voiceProfile) {
        const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
        if (ELEVENLABS_API_KEY) {
          try {
            const ttsResponse = await fetch(
              `https://api.elevenlabs.io/v1/text-to-speech/${voiceProfile.elevenlabs_voice_id}?output_format=mp3_44100_128`,
              {
                method: 'POST',
                headers: {
                  'xi-api-key': ELEVENLABS_API_KEY,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  text: responseText,
                  model_id: 'eleven_multilingual_v2',
                  voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                    style: 0.3,
                    use_speaker_boost: true,
                  },
                }),
              }
            );

            if (ttsResponse.ok) {
              const audioBuffer = await ttsResponse.arrayBuffer();
              const { encode: base64Encode } = await import("https://deno.land/std@0.168.0/encoding/base64.ts");
              audioContent = base64Encode(new Uint8Array(audioBuffer));
              console.log('Voice audio generated successfully');
            } else {
              console.error('TTS failed:', ttsResponse.status, await ttsResponse.text());
            }
          } catch (ttsError) {
            console.error('TTS error:', ttsError);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        response: responseText,
        conversation_id: activeConversationId,
        audio_content: audioContent,
        person_name: personName,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in chat-with-legacy:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function buildFallbackPrompt(name: string, personality: Record<string, unknown>): string {
  const values = personality.values as Record<string, string[]> | null;
  const traits = personality.traits as Record<string, string[]> | null;
  const commStyle = personality.communication_style as Record<string, unknown> | null;
  const emotionalPatterns = personality.emotional_patterns as Record<string, unknown> | null;

  return `You are ${name}. Here is your personality model:

CORE VALUES: ${JSON.stringify(values || {})}
PERSONALITY TRAITS: ${JSON.stringify(traits || {})}
COMMUNICATION STYLE: ${JSON.stringify(commStyle || {})}
EMOTIONAL PATTERNS: ${JSON.stringify(emotionalPatterns || {})}
HUMOR STYLE: ${personality.humor_style || 'unknown'}
KEY STORIES: ${JSON.stringify(personality.key_stories || [])}
LIFE LESSONS: ${JSON.stringify(personality.life_lessons || [])}

Respond naturally as ${name} would. Use their vocabulary, reasoning patterns, and emotional style.`;
}
