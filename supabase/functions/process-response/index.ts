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
      // For audio/video without transcript, try to use the content field
      // (which may contain a brief description) or flag for manual transcription
      if (response.content && response.content.length > 20) {
        textToAnalyze = response.content;
      } else {
        console.log('No transcript available for audio/video response. Skipping analysis.');
        return new Response(
          JSON.stringify({ success: false, reason: 'no_transcript', message: 'Audio/video response needs transcription first' }),
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

    return new Response(
      JSON.stringify({ 
        success: true, 
        extracted,
        total_processed_responses: count,
        should_analyze_personality: shouldAnalyze
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
