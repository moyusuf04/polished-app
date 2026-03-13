-- =============================================================
-- Migration: Account Persistence Engine
-- Adds profile identity columns, rank system, and update policies.
-- =============================================================

-- 1. Extend the profiles table with identity + rank columns
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS rank text NOT NULL DEFAULT 'Obsidian'
    CHECK (rank IN ('Obsidian', 'Malachite', 'Lapis', 'Amethyst', 'Tiger''s Eye', 'Rose Quartz'));

-- 2. Allow authenticated users to UPDATE their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3. Rank thresholds utility function
-- Returns the rank label for a given XP total.
CREATE OR REPLACE FUNCTION compute_user_rank(total_xp int)
RETURNS text
LANGUAGE plpgsql IMMUTABLE AS $$
BEGIN
  IF total_xp >= 2500 THEN RETURN 'Rose Quartz';
  ELSIF total_xp >= 2000 THEN RETURN 'Tiger''s Eye';
  ELSIF total_xp >= 1500 THEN RETURN 'Amethyst';
  ELSIF total_xp >= 1000 THEN RETURN 'Lapis';
  ELSIF total_xp >= 500  THEN RETURN 'Malachite';
  ELSE RETURN 'Obsidian';
  END IF;
END;
$$;

-- 4. Storage bucket policy helper comment
-- NOTE: You must manually create a "avatars" storage bucket in Supabase Dashboard:
--   1. Go to Storage > New Bucket > Name: "avatars", Public: ON
--   2. Add RLS policies:
--      - SELECT: Allow public access (for serving images)
--      - INSERT: auth.uid()::text = (storage.foldername(name))[1]
--      - UPDATE: auth.uid()::text = (storage.foldername(name))[1]
--      - DELETE: auth.uid()::text = (storage.foldername(name))[1]
--   This ensures users can only upload to their own uid/ folder.

-- 5. Index for fast XP lookups
CREATE INDEX IF NOT EXISTS idx_user_progress_user
  ON user_progress(user_id);

CREATE INDEX IF NOT EXISTS idx_reflections_user
  ON reflections(user_id);

-- 6. Grant execute on the rank function
GRANT EXECUTE ON FUNCTION compute_user_rank(int) TO authenticated;
GRANT EXECUTE ON FUNCTION compute_user_rank(int) TO anon;
