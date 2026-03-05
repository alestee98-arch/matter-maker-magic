
-- Add age_group column to profiles
ALTER TABLE public.profiles ADD COLUMN age_group TEXT;

-- Create question_sequences table
CREATE TABLE public.question_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  age_group TEXT NOT NULL,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  UNIQUE (age_group, question_id),
  UNIQUE (age_group, position)
);

-- Enable RLS
ALTER TABLE public.question_sequences ENABLE ROW LEVEL SECURITY;

-- Public read policy (matches questions table)
CREATE POLICY "Question sequences are publicly readable"
  ON public.question_sequences
  FOR SELECT
  USING (true);
