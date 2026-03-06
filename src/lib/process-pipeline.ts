import { supabase } from "@/integrations/supabase/client";

/**
 * Enqueues a processing job for a response.
 * Instead of calling edge functions directly from the browser,
 * we insert a row into processing_jobs. The edge function picks it up server-side.
 */
export async function triggerProcessingPipeline(responseId: string, userId: string) {
  try {
    const { error } = await supabase
      .from('processing_jobs' as any)
      .insert({
        response_id: responseId,
        user_id: userId,
        status: 'pending',
        job_type: 'process_response',
      });

    if (error) {
      console.error('[Pipeline] Failed to enqueue job:', error);
    } else {
      console.log('[Pipeline] Job enqueued for response:', responseId);
    }
  } catch (err) {
    // Never let pipeline errors affect the user experience
    console.error('[Pipeline] Unexpected error:', err);
  }
}
