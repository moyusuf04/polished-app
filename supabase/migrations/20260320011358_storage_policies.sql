-- =============================================================
-- Migration: Storage RLS Policies for Avatars Bucket
-- Date: 2026-03-20
-- =============================================================

-- Ensure the avatars bucket exists (though usually created via dashboard)
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('avatars', 'avatars', true)
-- ON CONFLICT (id) DO NOTHING;

-- 1. DROP EXISTING POLICIES TO AVOID DUPLICATION
DROP POLICY IF EXISTS "Public avatar read" ON storage.objects;
DROP POLICY IF EXISTS "User avatar insert" ON storage.objects;
DROP POLICY IF EXISTS "User avatar update" ON storage.objects;
DROP POLICY IF EXISTS "User avatar delete" ON storage.objects;

-- 2. Allow public read access to all avatar objects
CREATE POLICY "Public avatar read"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- 3. Allow authenticated users to insert only into their own folder
CREATE POLICY "User avatar insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Allow authenticated users to update only their own avatar objects
CREATE POLICY "User avatar update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. Allow authenticated users to delete only their own avatar objects
CREATE POLICY "User avatar delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
