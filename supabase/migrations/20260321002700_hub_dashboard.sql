-- =============================================================
-- Migration: Hub Dashboard Schema Extensions
-- Created: 2026-03-21
-- Adds energy system, streak tracking, lesson_categories junction,
-- mineral grade function, and performance index.
-- =============================================================

-- 1. Extend profiles table with energy & streak columns
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS energy_units INT DEFAULT 5,
  ADD COLUMN IF NOT EXISTS last_lesson_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS current_streak INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_energy_reset TIMESTAMPTZ DEFAULT now();

-- 2. Junction table for hybrid/bridge nodes (lesson belongs to multiple categories)
CREATE TABLE IF NOT EXISTS lesson_categories (
  lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (lesson_id, category_id)
);

-- RLS for lesson_categories: public read, admin-only write
ALTER TABLE lesson_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lesson_categories_select_all"
  ON lesson_categories FOR SELECT
  USING (true);

CREATE POLICY "lesson_categories_insert_admin"
  ON lesson_categories FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "lesson_categories_delete_admin"
  ON lesson_categories FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 3. Performance index for leaderboard XP aggregation
CREATE INDEX IF NOT EXISTS idx_user_progress_user_completed
  ON user_progress(user_id, completed_at);

-- 4. mineral_grade() function — returns simplified 3-tier badge
-- NOTE: This is the Hub StatusBar grade (Quartz/Emerald/Diamond).
-- The Account Page uses the detailed 6-mineral rank system separately.
CREATE OR REPLACE FUNCTION mineral_grade(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  total_xp INT;
BEGIN
  SELECT COALESCE(SUM(l.xp_reward), 0)
  INTO total_xp
  FROM user_progress up
  JOIN lessons l ON l.id = up.lesson_id
  WHERE up.user_id = p_user_id;

  IF total_xp >= 5000 THEN
    RETURN 'Diamond';
  ELSIF total_xp >= 1000 THEN
    RETURN 'Emerald';
  ELSE
    RETURN 'Quartz';
  END IF;
END;
$$;

-- 5. get_leaderboard() RPC — top 5 users by total XP (privacy-safe)
CREATE OR REPLACE FUNCTION get_leaderboard()
RETURNS TABLE(
  user_id UUID,
  display_name TEXT,
  total_xp BIGINT,
  grade TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id AS user_id,
    p.display_name,
    COALESCE(SUM(l.xp_reward), 0)::BIGINT AS total_xp,
    mineral_grade(p.id) AS grade
  FROM profiles p
  LEFT JOIN user_progress up ON up.user_id = p.id
  LEFT JOIN lessons l ON l.id = up.lesson_id
  WHERE p.role != 'guest'
  GROUP BY p.id, p.display_name
  ORDER BY total_xp DESC
  LIMIT 5;
END;
$$;
