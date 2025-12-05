-- =============================================
-- MATTER: AI Twin Database Schema
-- =============================================

-- Enable the pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- =============================================
-- 1. USER PROFILES
-- =============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name TEXT,
  birth_date DATE,
  bio TEXT,
  avatar_url TEXT,
  legacy_status TEXT DEFAULT 'active' CHECK (legacy_status IN ('active', 'legacy')),
  legacy_activated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'display_name');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 2. WEEKLY QUESTIONS
-- =============================================
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  question TEXT NOT NULL,
  depth TEXT DEFAULT 'surface' CHECK (depth IN ('surface', 'medium', 'deep', 'profound')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Questions are viewable by authenticated users"
  ON public.questions FOR SELECT
  TO authenticated
  USING (true);

-- =============================================
-- 3. USER RESPONSES (with embeddings for RAG)
-- =============================================
CREATE TABLE public.responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.questions(id),
  
  -- Response content
  content TEXT NOT NULL,
  content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'audio', 'video')),
  audio_url TEXT,
  video_url TEXT,
  transcript TEXT,
  
  -- AI/RAG fields
  embedding vector(1536),
  summary TEXT,
  extracted_values TEXT[],
  extracted_emotions TEXT[],
  
  -- Privacy settings
  privacy TEXT DEFAULT 'private' CHECK (privacy IN ('private', 'shared', 'legacy')),
  
  -- Metadata
  word_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own responses"
  ON public.responses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own responses"
  ON public.responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own responses"
  ON public.responses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own responses"
  ON public.responses FOR DELETE
  USING (auth.uid() = user_id);

-- Index for vector similarity search
CREATE INDEX ON public.responses USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- =============================================
-- 4. PERSONALITY PROFILES (AI Twin Core)
-- =============================================
CREATE TABLE public.personality_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Core personality traits
  traits JSONB DEFAULT '{}',
  values JSONB DEFAULT '{}',
  beliefs JSONB DEFAULT '{}',
  
  -- Communication style
  communication_style JSONB DEFAULT '{}',
  humor_style TEXT,
  emotional_patterns JSONB DEFAULT '{}',
  
  -- Life context
  key_stories TEXT[],
  important_people JSONB DEFAULT '[]',
  life_lessons TEXT[],
  
  -- AI system prompt (dynamically generated)
  system_prompt TEXT,
  
  -- Stats
  total_responses INTEGER DEFAULT 0,
  last_analyzed_at TIMESTAMP WITH TIME ZONE,
  confidence_score NUMERIC(3,2) DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.personality_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own personality profile"
  ON public.personality_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own personality profile"
  ON public.personality_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own personality profile"
  ON public.personality_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 5. VOICE PROFILES
-- =============================================
CREATE TABLE public.voice_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  elevenlabs_voice_id TEXT NOT NULL,
  
  -- Voice characteristics
  sample_count INTEGER DEFAULT 0,
  total_audio_duration INTEGER DEFAULT 0, -- in seconds
  
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.voice_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own voice profiles"
  ON public.voice_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own voice profiles"
  ON public.voice_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own voice profiles"
  ON public.voice_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own voice profiles"
  ON public.voice_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- 6. LEGACY CIRCLES (who can access after death)
-- =============================================
CREATE TABLE public.legacy_circles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  email TEXT,
  relationship TEXT,
  access_level TEXT DEFAULT 'basic' CHECK (access_level IN ('basic', 'full', 'executor')),
  
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.legacy_circles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own legacy circle"
  ON public.legacy_circles FOR ALL
  USING (auth.uid() = user_id);

-- =============================================
-- 7. CONVERSATIONS WITH AI TWIN
-- =============================================
CREATE TABLE public.ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  visitor_id UUID REFERENCES public.legacy_circles(id),
  visitor_name TEXT,
  
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  message_count INTEGER DEFAULT 0
);

CREATE TABLE public.ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  audio_url TEXT,
  
  -- For RAG tracking
  retrieved_response_ids UUID[],
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

-- Allow legacy circle members to view conversations
CREATE POLICY "Legacy circle can view conversations"
  ON public.ai_conversations FOR SELECT
  USING (
    auth.uid() = legacy_user_id OR
    visitor_id IN (SELECT id FROM public.legacy_circles WHERE user_id = legacy_user_id)
  );

CREATE POLICY "Legacy circle can insert conversations"
  ON public.ai_conversations FOR INSERT
  WITH CHECK (
    visitor_id IN (SELECT id FROM public.legacy_circles)
  );

CREATE POLICY "Legacy circle can view messages"
  ON public.ai_messages FOR SELECT
  USING (
    conversation_id IN (SELECT id FROM public.ai_conversations)
  );

CREATE POLICY "Legacy circle can insert messages"
  ON public.ai_messages FOR INSERT
  WITH CHECK (
    conversation_id IN (SELECT id FROM public.ai_conversations)
  );

-- =============================================
-- UPDATE TRIGGERS
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_responses_updated_at
  BEFORE UPDATE ON public.responses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_personality_profiles_updated_at
  BEFORE UPDATE ON public.personality_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();