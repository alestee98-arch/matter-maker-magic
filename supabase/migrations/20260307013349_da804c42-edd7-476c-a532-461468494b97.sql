
-- Create notification_log table
CREATE TABLE public.notification_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  question_id uuid REFERENCES public.questions(id),
  channel text NOT NULL,
  status text NOT NULL DEFAULT 'sent',
  provider_message_id text,
  error_message text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notification_log ENABLE ROW LEVEL SECURITY;

-- Service role can manage all (edge function uses service role)
CREATE POLICY "Service role full access" ON public.notification_log FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON public.notification_log FOR SELECT TO authenticated USING (auth.uid() = user_id);
