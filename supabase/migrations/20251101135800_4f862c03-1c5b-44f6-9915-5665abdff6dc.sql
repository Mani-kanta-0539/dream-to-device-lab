-- Make analysis-videos bucket public so AI can access videos
UPDATE storage.buckets 
SET public = true 
WHERE id = 'analysis-videos';

-- Add RLS policy for users to upload their own videos
CREATE POLICY "Users can upload their own videos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'analysis-videos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Add RLS policy for users to view their own videos
CREATE POLICY "Users can view their own videos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'analysis-videos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access for AI analysis
CREATE POLICY "Public can read analysis videos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'analysis-videos');