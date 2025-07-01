
-- Create the media storage bucket for shade images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for public access to media bucket
CREATE POLICY "Public can view media files" ON storage.objects
FOR SELECT 
USING (bucket_id = 'media');

-- Allow authenticated users to upload to media bucket (will be restricted by admin check)
CREATE POLICY "Allow uploads to media bucket" ON storage.objects
FOR INSERT 
WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');
