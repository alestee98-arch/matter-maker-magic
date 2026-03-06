-- =============================================
-- MATTER BACKEND V2
-- Production-grade schema additions
-- (Lovable handled: processing_jobs, onboarding_completed, current_sequence_position)
-- This migration adds what Lovable did NOT add
-- =============================================

-- 1. PROFILE IMPROVEMENTS (fields Lovable didn't add)
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS last_question_sent_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS total_responses INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/New_York',
  ADD COLUMN IF NOT EXISTS subject_type TEXT CHECK (subject_type IN ('self', 'family', 'other')),
  ADD COLUMN IF NOT EXISTS user_role TEXT,
  ADD COLUMN IF NOT EXISTS urgency TEXT CHECK (urgency IN ('high', 'medium', 'low'));

-- 2. NOTIFICATION LOG
CREATE TABLE IF NOT EXISTS public.notification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.questions(id),
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'bounced')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  error_message TEXT,
  provider_message_id TEXT,
  metadata JSONB DEFAULT '{}'
);

ALTER TABLE public.notification_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only on notification_log" ON public.notification_log USING (false);

CREATE INDEX IF NOT EXISTS idx_notification_log_user_id ON public.notification_log(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_log_sent_at ON public.notification_log(sent_at DESC);

-- 3. ADD PROCESSING STATUS TO RESPONSES
ALTER TABLE public.responses
  ADD COLUMN IF NOT EXISTS processing_status TEXT DEFAULT 'pending' 
    CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP WITH TIME ZONE;

-- 4. TRIGGER: auto-increment total_responses on profile
CREATE OR REPLACE FUNCTION public.increment_response_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles 
  SET 
    total_responses = total_responses + 1,
    last_active_at = NOW()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_response_created ON public.responses;
CREATE TRIGGER on_response_created
  AFTER INSERT ON public.responses
  FOR EACH ROW EXECUTE FUNCTION public.increment_response_count();

-- 5. TRIGGER: auto-advance sequence position
CREATE OR REPLACE FUNCTION public.advance_sequence_position()
RETURNS TRIGGER AS $$
DECLARE
  v_age_group TEXT;
  v_current_pos INTEGER;
  v_question_pos INTEGER;
BEGIN
  SELECT age_group, current_sequence_position INTO v_age_group, v_current_pos
  FROM public.profiles WHERE id = NEW.user_id;

  IF v_age_group IS NULL THEN RETURN NEW; END IF;

  SELECT position INTO v_question_pos
  FROM public.question_sequences
  WHERE age_group = v_age_group AND question_id = NEW.question_id;

  IF v_question_pos IS NOT NULL AND v_question_pos >= v_current_pos THEN
    UPDATE public.profiles
    SET current_sequence_position = v_question_pos + 1
    WHERE id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_response_advance_sequence ON public.responses;
CREATE TRIGGER on_response_advance_sequence
  AFTER INSERT ON public.responses
  FOR EACH ROW EXECUTE FUNCTION public.advance_sequence_position();

-- 6. INDEXES
CREATE INDEX IF NOT EXISTS idx_responses_user_id ON public.responses(user_id);
CREATE INDEX IF NOT EXISTS idx_responses_question_id ON public.responses(question_id);
CREATE INDEX IF NOT EXISTS idx_responses_created_at ON public.responses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_question_sequences_age_group_position ON public.question_sequences(age_group, position);
CREATE INDEX IF NOT EXISTS idx_profiles_age_group ON public.profiles(age_group);
CREATE INDEX IF NOT EXISTS idx_profiles_last_question_sent ON public.profiles(last_question_sent_at);
CREATE INDEX IF NOT EXISTS idx_processing_jobs_status ON public.processing_jobs(status);

-- 7. UNIQUE CONSTRAINT on questions
ALTER TABLE public.questions 
  ADD CONSTRAINT IF NOT EXISTS questions_text_unique UNIQUE (question);

