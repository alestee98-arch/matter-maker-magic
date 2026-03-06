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

  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) {
    return new Response(JSON.stringify({ error: 'LOVABLE_API_KEY not configured' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Support both direct invocation and job queue polling
  let response_id: string | null = null;
  let job_id: string | null = null;

  try {
    const body = await req.json().catch(() => ({}));
    response_id = body.response_id || null;
  } catch { /* empty body is fine for polling mode */ }

  // If no direct response_id, poll for pending jobs
  if (!response_id) {
    const { data: pendingJob, error: pollErr } = await supabase
      .from('processing_jobs')
      .select('id, response_id, user_id')
      .eq('status', 'pending')
      .eq('job_type', 'process_response')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (pollErr || !pendingJob) {
      return new Response(
        JSON.stringify({ message: 'No pending jobs' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    response_id = pendingJob.response_id;
    job_id = pendingJob.id;
  }

  // Mark job as processing
  if (job_id) {
    await supabase
      .from('processing_jobs')
      .update({ status: 'processing', updated_at: new Date().toISOString() })
      .eq('id', job_id);
  }

  try {
    if (!response_id) throw new Error('response_id is required');

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
      textToAnalyze = response.transcript;
    } else if (response.content_type === 'audio' || response.content_type === 'video') {
      const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
      if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not configured for transcription');

      const mediaUrl = response.audio_url || response.video_url;
      if (!mediaUrl) {
        throw new Error('No audio/video URL found on this response');
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
        headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` },
        body: whisperForm,
      });

      if (!whisperResponse.ok) {
        const whisperError = await whisperResponse.text();
        console.error('Whisper API error:', whisperResponse.status, whisperError);
        throw new Error(`Whisper transcription failed: ${whisperResponse.status}`);
      }

      const whisperResult = await whisperResponse.json();
      textToAnalyze = whisperResult.text || '';
      console.log(`Transcription complete: ${textToAnalyze.length} chars`);

      await supabase
        .from('responses')
        .update({ transcript: textToAnalyze })
        .eq('id', response_id);

      if (!textToAnalyze) {
        throw new Error('Whisper returned empty transcript');
      }
    } else {
      textToAnalyze = response.content;
    }

    const questionContext = response.questions
      ? `Question: "${response.questions.question}" (Category: ${response.questions.category})`
      : 'No specific question context';

    // Step 1: Extract values, emotions, and summary
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
      throw new Error(`AI analysis failed: ${analysisResponse.status}`);
    }

    const analysisResult = await analysisResponse.json();
    const toolCall = analysisResult.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error('No tool call in AI response');

    const extracted = JSON.parse(toolCall.function.arguments);
    console.log('Extracted:', extracted);

    // Step 2: Generate embedding via OpenAI
    let embedding = null;
    try {
      const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
      if (OPENAI_API_KEY) {
        const embeddingInput = textToAnalyze.slice(0, 8000);
        const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ model: 'text-embedding-3-small', input: embeddingInput }),
        });

        if (embeddingResponse.ok) {
          const embeddingResult = await embeddingResponse.json();
          embedding = embeddingResult.data?.[0]?.embedding;
        }
      }
    } catch (embErr) {
      console.error('[Embedding] Error:', embErr);
    }

    // Step 3: Update the response record
    const updateData: Record<string, unknown> = {
      extracted_values: extracted.values || [],
      extracted_emotions: extracted.emotions || [],
      summary: extracted.summary || '',
      word_count: textToAnalyze.split(/\s+/).filter(Boolean).length,
    };

    if (embedding) updateData.embedding = JSON.stringify(embedding);
    if (response.content_type === 'text' && !response.transcript) {
      updateData.transcript = textToAnalyze;
    }

    const { error: updateError } = await supabase
      .from('responses')
      .update(updateData)
      .eq('id', response_id);

    if (updateError) throw new Error(`Failed to update response: ${updateError.message}`);

    console.log(`Response ${response_id} processed successfully`);

    // Step 4: Check if we should trigger personality analysis
    const { count } = await supabase
      .from('responses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', response.user_id)
      .not('summary', 'is', null);

    const shouldAnalyze = count && (count % 5 === 0 || count === 1);

    // Step 5: Auto voice cloning
    let voiceCloneResult = null;
    const hasAudio = response.content_type === 'audio' || response.content_type === 'video';

    if (hasAudio) {
      try {
        const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
        if (ELEVENLABS_API_KEY) {
          const { data: audioResponses } = await supabase
            .from('responses')
            .select('audio_url, video_url, content_type')
            .eq('user_id', response.user_id)
            .or('content_type.eq.audio,content_type.eq.video')
            .order('created_at', { ascending: true });

          const mediaUrls = (audioResponses || [])
            .map(r => r.audio_url || r.video_url)
            .filter(Boolean) as string[];

          if (mediaUrls.length > 0) {
            const audioFiles: File[] = [];
            for (let i = 0; i < mediaUrls.length; i++) {
              try {
                const audioResp = await fetch(mediaUrls[i]);
                if (audioResp.ok) {
                  const blob = await audioResp.blob();
                  audioFiles.push(new File([blob], `sample_${i + 1}.webm`, { type: blob.type }));
                }
              } catch { /* skip failed downloads */ }
            }

            if (audioFiles.length > 0) {
              const { data: existingVoice } = await supabase
                .from('voice_profiles')
                .select('elevenlabs_voice_id')
                .eq('user_id', response.user_id)
                .eq('is_primary', true)
                .maybeSingle();

              if (existingVoice?.elevenlabs_voice_id) {
                await fetch(`https://api.elevenlabs.io/v1/voices/${existingVoice.elevenlabs_voice_id}`, {
                  method: 'DELETE',
                  headers: { 'xi-api-key': ELEVENLABS_API_KEY },
                });
              }

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

              if (cloneResp.ok) {
                const cloneResult = await cloneResp.json();

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

                voiceCloneResult = { voice_id: cloneResult.voice_id, samples: audioFiles.length };
              }
            }
          }
        }
      } catch (voiceErr) {
        console.error('[VoiceClone] Error:', voiceErr);
      }
    }

    // If triggered via job queue, also auto-trigger personality analysis
    if (shouldAnalyze && job_id) {
      try {
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
        const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
        await fetch(`${SUPABASE_URL}/functions/v1/analyze-personality`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_id: response.user_id }),
        });
        console.log('[Pipeline] Triggered personality analysis');
      } catch (paErr) {
        console.error('[Pipeline] Failed to trigger personality analysis:', paErr);
      }
    }

    // Mark job as completed
    if (job_id) {
      await supabase
        .from('processing_jobs')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .eq('id', job_id);
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

    // Mark job as failed
    if (job_id) {
      await supabase
        .from('processing_jobs')
        .update({
          status: 'failed',
          error: (error as Error).message,
          updated_at: new Date().toISOString(),
        })
        .eq('id', job_id);
    }

    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
