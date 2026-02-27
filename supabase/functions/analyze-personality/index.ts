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
    const { user_id } = await req.json();
    if (!user_id) throw new Error('user_id is required');

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Fetch ALL responses with transcripts/content for this user
    const { data: responses, error: fetchError } = await supabase
      .from('responses')
      .select('content, transcript, content_type, extracted_values, extracted_emotions, summary, created_at, questions(question, category)')
      .eq('user_id', user_id)
      .order('created_at', { ascending: true });

    if (fetchError) throw new Error(`Failed to fetch responses: ${fetchError.message}`);
    if (!responses || responses.length === 0) {
      return new Response(
        JSON.stringify({ success: false, reason: 'no_responses', message: 'No responses found for this user' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Analyzing personality from ${responses.length} responses for user ${user_id}`);

    // Build the transcript compilation
    const transcriptCompilation = responses.map((r, i) => {
      const text = r.transcript || r.content;
      const question = r.questions?.question || 'Unknown question';
      const category = r.questions?.category || 'general';
      const values = r.extracted_values?.join(', ') || 'not extracted';
      const emotions = r.extracted_emotions?.join(', ') || 'not extracted';
      
      return `--- Response ${i + 1} (${category}) ---
Question: "${question}"
Answer: "${text}"
Values detected: ${values}
Emotions detected: ${emotions}
Summary: ${r.summary || 'none'}
Date: ${r.created_at}`;
    }).join('\n\n');

    // Send to Lovable AI for deep personality analysis
    const analysisResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          {
            role: 'system',
            content: `You are building a deep personality model from a person's reflective responses over time. Your goal is NOT to summarize what they said, but to extract HOW they think, reason, and feel.

Analyze patterns ACROSS all responses to identify:
1. Core beliefs - fundamental truths they hold
2. Values hierarchy - what matters most, in order
3. Personality traits - how they show up in the world  
4. Communication style - how they express themselves (vocabulary patterns, sentence structure, use of humor, metaphor, directness)
5. Emotional patterns - how they process and express feelings
6. Reasoning style - how they make decisions and think through problems
7. Key formative stories - experiences that shaped who they are
8. Life lessons - wisdom they've accumulated
9. Important people - who matters most and why
10. Humor style - how and when they use humor
11. Contradictions - tensions in their worldview that make them human

Also generate a system prompt that could be used to make an AI respond AS this person. The prompt should capture their voice, reasoning patterns, and emotional texture - not just their opinions.`
          },
          {
            role: 'user',
            content: `Here are ${responses.length} responses from the same person across different life questions:\n\n${transcriptCompilation}`
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'build_personality_model',
              description: 'Build a comprehensive personality model from analyzed responses',
              parameters: {
                type: 'object',
                properties: {
                  traits: {
                    type: 'object',
                    description: 'Personality traits with confidence scores',
                    properties: {
                      primary: { type: 'array', items: { type: 'string' } },
                      secondary: { type: 'array', items: { type: 'string' } }
                    }
                  },
                  values: {
                    type: 'object',
                    description: 'Values hierarchy',
                    properties: {
                      core: { type: 'array', items: { type: 'string' }, description: 'Top 3-5 non-negotiable values' },
                      important: { type: 'array', items: { type: 'string' }, description: 'Secondary values' }
                    }
                  },
                  beliefs: {
                    type: 'object',
                    description: 'Core beliefs about life',
                    properties: {
                      fundamental: { type: 'array', items: { type: 'string' } },
                      contradictions: { type: 'array', items: { type: 'string' } }
                    }
                  },
                  communication_style: {
                    type: 'object',
                    properties: {
                      vocabulary_level: { type: 'string' },
                      sentence_patterns: { type: 'string' },
                      uses_metaphor: { type: 'boolean' },
                      directness: { type: 'string', enum: ['very_direct', 'direct', 'balanced', 'indirect', 'very_indirect'] },
                      storytelling_tendency: { type: 'string', enum: ['high', 'medium', 'low'] },
                      emotional_expressiveness: { type: 'string', enum: ['high', 'medium', 'low'] }
                    }
                  },
                  emotional_patterns: {
                    type: 'object',
                    properties: {
                      processing_style: { type: 'string', description: 'How they handle emotions' },
                      dominant_emotions: { type: 'array', items: { type: 'string' } },
                      emotional_triggers: { type: 'array', items: { type: 'string' } }
                    }
                  },
                  humor_style: { type: 'string', description: 'How and when they use humor' },
                  key_stories: { type: 'array', items: { type: 'string' }, description: 'Formative life stories that shaped them' },
                  life_lessons: { type: 'array', items: { type: 'string' }, description: 'Wisdom and lessons learned' },
                  important_people: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        relationship: { type: 'string' },
                        significance: { type: 'string' }
                      }
                    }
                  },
                  system_prompt: { type: 'string', description: 'A detailed system prompt that would make an AI respond as this person. Capture their voice, reasoning, emotional texture, humor, and values.' },
                  confidence_score: { type: 'number', description: 'How confident we are in this model (0-1), based on volume and depth of responses' }
                },
                required: ['traits', 'values', 'beliefs', 'communication_style', 'emotional_patterns', 'humor_style', 'key_stories', 'life_lessons', 'important_people', 'system_prompt', 'confidence_score'],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'build_personality_model' } }
      }),
    });

    if (!analysisResponse.ok) {
      const errText = await analysisResponse.text();
      console.error('AI personality analysis error:', analysisResponse.status, errText);
      if (analysisResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded, please try again later' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      if (analysisResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'AI usage limit reached. Please add credits.' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      throw new Error(`AI analysis failed: ${analysisResponse.status}`);
    }

    const result = await analysisResponse.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error('No tool call in AI personality response');

    const personality = JSON.parse(toolCall.function.arguments);
    console.log('Personality model built, confidence:', personality.confidence_score);

    // Upsert personality profile
    const { error: upsertError } = await supabase
      .from('personality_profiles')
      .upsert({
        user_id,
        traits: personality.traits,
        values: personality.values,
        beliefs: personality.beliefs,
        communication_style: personality.communication_style,
        emotional_patterns: personality.emotional_patterns,
        humor_style: personality.humor_style,
        key_stories: personality.key_stories,
        life_lessons: personality.life_lessons,
        important_people: personality.important_people,
        system_prompt: personality.system_prompt,
        confidence_score: personality.confidence_score,
        total_responses: responses.length,
        last_analyzed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (upsertError) throw new Error(`Failed to save personality profile: ${upsertError.message}`);

    console.log(`Personality profile saved for user ${user_id}`);

    return new Response(
      JSON.stringify({
        success: true,
        total_responses_analyzed: responses.length,
        confidence_score: personality.confidence_score,
        values: personality.values,
        traits: personality.traits
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in analyze-personality:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
