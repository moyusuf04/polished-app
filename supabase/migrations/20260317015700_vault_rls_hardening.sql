-- =============================================================
-- Migration: Vault RLS Hardening + saved_lessons table
-- Adds missing RLS policies, updates rank thresholds, creates saved_lessons table.
-- =============================================================

-- 1. Users can update their own reflections (needed for is_spotlighted toggle)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own reflections' AND tablename = 'reflections'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can update own reflections" ON reflections FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)';
  END IF;
END $$;

-- 2. Create saved_lessons table for user lesson bookmarks
CREATE TABLE IF NOT EXISTS saved_lessons (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id text REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE saved_lessons ENABLE ROW LEVEL SECURITY;

-- saved_lessons policies: users can only access their own saves
CREATE POLICY "Users can read own saved lessons" ON saved_lessons FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own saved lessons" ON saved_lessons FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own saved lessons" ON saved_lessons FOR DELETE USING (auth.uid() = user_id);

-- 3. Restrict vault_saves SELECT to own rows only (was public)
DROP POLICY IF EXISTS "Public can read vault saves" ON vault_saves;
CREATE POLICY "Users can read own vault saves" ON vault_saves FOR SELECT USING (auth.uid() = saved_by_user_id);

-- 4. Restrict user_alumni_feeds SELECT to own rows
DROP POLICY IF EXISTS "Public can read alumni feeds" ON user_alumni_feeds;
CREATE POLICY "Users can read own alumni feeds" ON user_alumni_feeds FOR SELECT USING (auth.uid() = user_id);

-- 5. Update compute_user_rank to match spec thresholds
CREATE OR REPLACE FUNCTION compute_user_rank(total_xp int)
RETURNS text
LANGUAGE plpgsql IMMUTABLE AS $$
BEGIN
  IF total_xp >= 1800 THEN RETURN 'Rose Quartz';
  ELSIF total_xp >= 1000 THEN RETURN 'Amethyst';
  ELSIF total_xp >= 600  THEN RETURN 'Tiger''s Eye';
  ELSIF total_xp >= 300  THEN RETURN 'Lapis Lazuli';
  ELSIF total_xp >= 100  THEN RETURN 'Malachite';
  ELSE RETURN 'Obsidian';
  END IF;
END;
$$;

-- 6. Performance indexes
CREATE INDEX IF NOT EXISTS idx_saved_lessons_user ON saved_lessons(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_lessons_lesson ON saved_lessons(lesson_id);
CREATE INDEX IF NOT EXISTS idx_reflections_spotlighted ON reflections(user_id) WHERE is_spotlighted = true;
