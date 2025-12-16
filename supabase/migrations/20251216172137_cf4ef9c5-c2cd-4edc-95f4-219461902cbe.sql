-- Add photo_url column to responses table for photo uploads
ALTER TABLE public.responses ADD COLUMN IF NOT EXISTS photo_url TEXT;