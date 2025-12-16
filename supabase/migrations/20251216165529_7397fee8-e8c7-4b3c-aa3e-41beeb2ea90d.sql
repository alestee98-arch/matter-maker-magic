-- Create storage bucket for user media (voice and video recordings)
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-media', 'user-media', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own media
CREATE POLICY "Users can upload their own media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to view their own media
CREATE POLICY "Users can view their own media"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'user-media'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access for shared media
CREATE POLICY "Public can view media"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-media');

-- Allow users to delete their own media
CREATE POLICY "Users can delete their own media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user-media'
  AND auth.uid()::text = (storage.foldername(name))[1]
);