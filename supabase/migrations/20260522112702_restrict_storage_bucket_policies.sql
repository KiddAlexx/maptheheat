-- Restrict storage buckets to image MIME types only and enforce server-side file size limits.
-- venue-images: 5 MB cap; avatars: 2 MB cap.
-- Allowed types cover all formats the client may upload (compressed webp variants + originals).

UPDATE storage.buckets
SET
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'],
  file_size_limit    = 5242880  -- 5 MB
WHERE name = 'venue-images';

UPDATE storage.buckets
SET
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'],
  file_size_limit    = 2097152  -- 2 MB
WHERE name = 'avatars';
