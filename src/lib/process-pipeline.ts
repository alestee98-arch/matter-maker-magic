import { supabase } from "@/integrations/supabase/client";

/**
 * Silently triggers the essence extraction pipeline for a response.
 * Runs in the background — never blocks the user experience.
 * 
 * Flow:
 * 1. process-response: transcribes (if audio/video) + extracts values/emotions/summary
 * 2. analyze-personality: rebuilds personality model every 5 responses
 */
export async function triggerProcessingPipeline(responseId: string, userId: string) {
  try {
    // Step 1: Process the response (transcribe + extract essence)
    const { data, error } = await supabase.functions.invoke('process-response', {
      body: { response_id: responseId },
    });

    if (error) {
      console.error('[Pipeline] process-response error:', error);
      return;
    }

    console.log('[Pipeline] Response processed:', data);

    // Step 2: If enough responses have accumulated, rebuild personality model
    if (data?.should_analyze_personality) {
      console.log('[Pipeline] Triggering personality analysis...');
      
      const { data: personalityData, error: personalityError } = await supabase.functions.invoke('analyze-personality', {
        body: { user_id: userId },
      });

      if (personalityError) {
        console.error('[Pipeline] analyze-personality error:', personalityError);
      } else {
        console.log('[Pipeline] Personality model updated:', personalityData);
      }
    }
  } catch (err) {
    // Never let pipeline errors affect the user experience
    console.error('[Pipeline] Unexpected error:', err);
  }
}
