-- Drop the existing check constraint and add a new one that includes 'photo'
ALTER TABLE public.responses DROP CONSTRAINT IF EXISTS responses_content_type_check;
ALTER TABLE public.responses ADD CONSTRAINT responses_content_type_check CHECK (content_type IN ('text', 'audio', 'video', 'photo'));