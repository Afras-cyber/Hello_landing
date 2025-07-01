
-- Create storage bucket for portfolio images if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio',
  'portfolio',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for portfolio bucket
CREATE POLICY "Public can view portfolio images" ON storage.objects
FOR SELECT USING (bucket_id = 'portfolio');

CREATE POLICY "Authenticated users can upload portfolio images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'portfolio' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update portfolio images" ON storage.objects
FOR UPDATE USING (bucket_id = 'portfolio' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete portfolio images" ON storage.objects
FOR DELETE USING (bucket_id = 'portfolio' AND auth.role() = 'authenticated');
