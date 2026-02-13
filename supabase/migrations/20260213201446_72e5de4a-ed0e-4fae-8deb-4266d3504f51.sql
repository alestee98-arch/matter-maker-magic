
-- Add phone number and notification preferences to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notify_email boolean DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notify_sms boolean DEFAULT true;
