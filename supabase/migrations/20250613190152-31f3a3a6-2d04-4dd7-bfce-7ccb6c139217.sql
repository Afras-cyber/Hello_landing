
-- Create storage bucket for screenshots
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'screenshots',
  'screenshots',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for screenshots bucket
CREATE POLICY "Public can view screenshots" ON storage.objects
FOR SELECT USING (bucket_id = 'screenshots');

CREATE POLICY "Anyone can upload screenshots" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'screenshots');

CREATE POLICY "Anyone can update screenshots" ON storage.objects
FOR UPDATE USING (bucket_id = 'screenshots');

CREATE POLICY "Anyone can delete screenshots" ON storage.objects
FOR DELETE USING (bucket_id = 'screenshots');
