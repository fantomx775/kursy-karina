-- Bucket Storage dla zdjęć kursów i plików SVG
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-assets', 'course-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public course assets are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'course-assets');

CREATE POLICY "Authenticated users can upload course assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'course-assets'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own course assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'course-assets'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their own course assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'course-assets'
  AND auth.role() = 'authenticated'
);

GRANT ALL ON storage.objects TO authenticated;
GRANT SELECT ON storage.objects TO anon;
