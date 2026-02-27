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
    const { response_id } = await req.json();
    if (!response_id) throw new Error('response_id is required');

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Fetch the response
    const { data: response, error: fetchError } = await supabase
      .from('responses')
      .select('*, questions(question, category)')
      .eq('id', response_id)
      .single();

    if (fetchError || !response) throw new Error(`Response not found: ${fetchError?.message}`);

    console.log(`Processing response ${response_id}, type: ${response.content_type}`);

    // Determine the text to analyze
    let textToAnalyze = '';

    if (response.content_type === 'text') {
      textToAnalyze = response.content;
    } else if (response.transcript) {
      // Already has a transcript (from browser speech recognition)
      textToAnalyze = response.transcript;
    } else if (response.content_type === 'audio' || response.content_type === 'video') {
      // Auto-transcribe using OpenAI Whisper
      const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
      if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not configured for transcription');

      const mediaUrl = response.audio_url || response.video_url;
      if (!mediaUrl) {
        return new Response(
          JSON.stringify({ success: false, reason: 'no_media_url', message: 'No audio/video URL found on this response' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Downloading media from: ${mediaUrl}`);
      const mediaResponse = await fetch(mediaUrl);
      if (!mediaResponse.ok) throw new Error(`Failed to download media: ${mediaResponse.status}`);

      const mediaBlob = await mediaResponse.blob();
      const extension = response.content_type === 'video' ? 'mp4' : 'webm';
      const mediaFile = new File([mediaBlob], `recording.${extension}`, { type: mediaBlob.type });

      console.log(`Sending to Whisper for transcription (${(mediaBlob.size / 1024).toFixed(0)} KB)...`);

      const whisperForm = new FormData();
      whisperForm.append('file', mediaFile);
      whisperForm.append('model', 'whisper-1');
      whisperForm.append('response_format', 'verbose_json');

      const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: whisperForm,
      });

      if (!whisperResponse.ok) {
        const whisperError = await whisperResponse.text();
        console.error('Whisper API error:', whisperResponse.status, whisperError);
        throw new Error(`Whisper transcription failed: ${whisperResponse.status}`);
      }

      const whisperResult = await whisperResponse.json();
      textToAnalyze = whisperResult.text || '';
      console.log(`Transcription complete: ${textToAnalyze.length} chars, language: ${whisperResult.language}`);

      // Save transcript immediately
      await supabase
        .from('responses')
        .update({ transcript: textToAnalyze })
        .eq('id', response_id);

      if (!textToAnalyze) {
        return new Response(
          JSON.stringify({ success: false, reason: 'empty_transcript', message: 'Whisper returned empty transcript' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      textToAnalyze = response.content;
    }

    const questionContext = response.questions 
      ? `Question: "${response.questions.question}" (Category: ${response.questions.category})`
      : 'No specific question context';

    // Step 1: Extract values, emotions, and summary using Lovable AI
    console.log('Extracting values, emotions, and summary...');

    const analysisResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are analyzing a personal reflection response to extract the person's essence.
            
You must respond with a JSON object using this exact tool call format. Extract:
- values: The core values this person demonstrates (array of strings, max 5)
- emotions: The emotional tones present in this response (array of strings, max 5)  
- summary: A 1-2 sentence summary capturing the emotional and philosophical core of what they shared (not just facts)`
          },
          {
            role: 'user',
            content: `${questionContext}\n\nResponse:\n"${textToAnalyze}"`
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'extract_essence',
              description: 'Extract values, emotions, and summary from a personal reflection',
              parameters: {
                type: 'object',
                properties: {
                  values: { type: 'array', items: { type: 'string' }, description: 'Core values demonstrated' },
                  emotions: { type: 'array', items: { type: 'string' }, description: 'Emotional tones present' },
                  summary: { type: 'string', description: 'Emotional and philosophical summary' }
                },
                required: ['values', 'emotions', 'summary'],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'extract_essence' } }
      }),
    });

    if (!analysisResponse.ok) {
      const errText = await analysisResponse.text();
      console.error('AI analysis error:', analysisResponse.status, errText);
      if (analysisResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded, please try again later' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      throw new Error(`AI analysis failed: ${analysisResponse.status}`);
    }

    const analysisResult = await analysisResponse.json();
    const toolCall = analysisResult.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) throw new Error('No tool call in AI response');

    const extracted = JSON.parse(toolCall.function.arguments);
    console.log('Extracted:', extracted);

    // Step 2: Update the response record
    const updateData: Record<string, unknown> = {
      extracted_values: extracted.values || [],
      extracted_emotions: extracted.emotions || [],
      summary: extracted.summary || '',
      word_count: textToAnalyze.split(/\s+/).filter(Boolean).length,
    };

    // If we used content as transcript for text responses, set transcript
    if (response.content_type === 'text' && !response.transcript) {
      updateData.transcript = textToAnalyze;
    }

    const { error: updateError } = await supabase
      .from('responses')
      .update(updateData)
      .eq('id', response_id);

    if (updateError) throw new Error(`Failed to update response: ${updateError.message}`);

    console.log(`Response ${response_id} processed successfully`);

    // Step 3: Check if we should trigger personality analysis
    const { count } = await supabase
      .from('responses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', response.user_id)
      .not('summary', 'is', null);

    const shouldAnalyze = count && (count % 5 === 0 || count === 1);

    // Step 4: Auto voice cloning — if this response has audio, re-clone with all samples
    let voiceCloneResult = null;
    const hasAudio = response.content_type === 'audio' || response.content_type === 'video';
    
    if (hasAudio) {
      try {
        const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
        if (!ELEVENLABS_API_KEY) {
          console.log('[VoiceClone] ELEVENLABS_API_KEY not configured, skipping');
        } else {
          console.log('[VoiceClone] Audio response detected, gathering all audio samples...');

          // Fetch all audio/video URLs for this user
          const { data: audioResponses, error: audioErr } = await supabase
            .from('responses')
            .select('audio_url, video_url, content_type')
            .eq('user_id', response.user_id)
            .or('content_type.eq.audio,content_type.eq.video')
            .order('created_at', { ascending: true });

          if (audioErr) {
            console.error('[VoiceClone] Failed to fetch audio responses:', audioErr.message);
          } else {
            const mediaUrls = (audioResponses || [])
              .map(r => r.audio_url || r.video_url)
              .filter(Boolean) as string[];

            console.log(`[VoiceClone] Found ${mediaUrls.length} audio sample(s) for user ${response.user_id}`);

            if (mediaUrls.length > 0) {
              // Download all audio files
              const audioFiles: File[] = [];
              for (let i = 0; i < mediaUrls.length; i++) {
                try {
                  const audioResp = await fetch(mediaUrls[i]);
                  if (!audioResp.ok) {
                    console.warn(`[VoiceClone] Failed to download sample ${i + 1}: ${audioResp.status}`);
                    continue;
                  }
                  const blob = await audioResp.blob();
                  audioFiles.push(new File([blob], `sample_${i + 1}.webm`, { type: blob.type }));
                } catch (dlErr) {
                  console.warn(`[VoiceClone] Error downloading sample ${i + 1}:`, dlErr);
                }
              }

              if (audioFiles.length > 0) {
                // Check for existing voice profile
                const { data: existingVoice } = await supabase
                  .from('voice_profiles')
                  .select('elevenlabs_voice_id')
                  .eq('user_id', response.user_id)
                  .eq('is_primary', true)
                  .single();

                // If there's an existing voice, delete it from ElevenLabs first
                if (existingVoice?.elevenlabs_voice_id) {
                  console.log(`[VoiceClone] Deleting previous voice: ${existingVoice.elevenlabs_voice_id}`);
                  await fetch(`https://api.elevenlabs.io/v1/voices/${existingVoice.elevenlabs_voice_id}`, {
                    method: 'DELETE',
                    headers: { 'xi-api-key': ELEVENLABS_API_KEY },
                  });
                }

                // Create new voice clone with all accumulated samples
                const cloneForm = new FormData();
                cloneForm.append('name', `matter-${response.user_id.slice(0, 8)}`);
                cloneForm.append('description', `Auto-cloned voice from ${audioFiles.length} response(s)`);
                for (const file of audioFiles) {
                  cloneForm.append('files', file, file.name);
                }

                const cloneResp = await fetch('https://api.elevenlabs.io/v1/voices/add', {
                  method: 'POST',
                  headers: { 'xi-api-key': ELEVENLABS_API_KEY },
                  body: cloneForm,
                });

                if (!cloneResp.ok) {
                  const errText = await cloneResp.text();
                  console.error('[VoiceClone] ElevenLabs error:', cloneResp.status, errText);
                } else {
                  const cloneResult = await cloneResp.json();
                  console.log('[VoiceClone] Voice created:', cloneResult.voice_id);

                  // Upsert voice profile in database
                  const { error: upsertErr } = await supabase
                    .from('voice_profiles')
                    .upsert({
                      user_id: response.user_id,
                      elevenlabs_voice_id: cloneResult.voice_id,
                      name: `matter-${response.user_id.slice(0, 8)}`,
                      description: `Auto-cloned from ${audioFiles.length} sample(s)`,
                      sample_count: audioFiles.length,
                      is_primary: true,
                    }, { onConflict: 'user_id,is_primary' });

                  if (upsertErr) {
                    // If upsert fails (no unique constraint), try delete+insert
                    console.log('[VoiceClone] Upsert failed, trying delete+insert:', upsertErr.message);
                    await supabase
                      .from('voice_profiles')
                      .delete()
                      .eq('user_id', response.user_id)
                      .eq('is_primary', true);

                    await supabase
                      .from('voice_profiles')
                      .insert({
                        user_id: response.user_id,
                        elevenlabs_voice_id: cloneResult.voice_id,
                        name: `matter-${response.user_id.slice(0, 8)}`,
                        description: `Auto-cloned from ${audioFiles.length} sample(s)`,
                        sample_count: audioFiles.length,
                        is_primary: true,
                      });
                  }

                  voiceCloneResult = { voice_id: cloneResult.voice_id, samples: audioFiles.length };
                }
              }
            }
          }
        }
      } catch (voiceErr) {
        // Never let voice cloning errors break the pipeline
        console.error('[VoiceClone] Unexpected error:', voiceErr);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        extracted,
        total_processed_responses: count,
        should_analyze_personality: shouldAnalyze,
        voice_clone: voiceCloneResult,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in process-response:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
