-- =============================================================
-- Supabase Schema Update for Intellectual Vault (Account Page)
-- =============================================================

-- 1. Add new columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rank text DEFAULT 'obsidian';

-- 2. Add is_spotlighted to reflections for the Spotlight Archive
ALTER TABLE reflections ADD COLUMN IF NOT EXISTS is_spotlighted boolean DEFAULT false;

-- 3. Create vault_saves table for the "Insights Provided" Metric
CREATE TABLE IF NOT EXISTS vault_saves (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  saved_by_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reflection_id uuid REFERENCES reflections(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(saved_by_user_id, reflection_id)
);

-- 4. Create user_alumni_feeds table for Alumni Credentials
CREATE TABLE IF NOT EXISTS user_alumni_feeds (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  topic text NOT NULL,
  mineral_key text NOT NULL,
  unlocked_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, topic)
);

-- =====================
-- ROW LEVEL SECURITY
-- =====================

ALTER TABLE vault_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_alumni_feeds ENABLE ROW LEVEL SECURITY;

-- vault_saves policies
-- Public can read who saved what (useful for metrics)
CREATE POLICY "Public can read vault saves" ON vault_saves FOR SELECT USING (true);
-- Users can insert their own saves
CREATE POLICY "Users can insert own saves" ON vault_saves FOR INSERT WITH CHECK (auth.uid() = saved_by_user_id);
-- Users can delete their own saves
CREATE POLICY "Users can delete own saves" ON vault_saves FOR DELETE USING (auth.uid() = saved_by_user_id);

-- user_alumni_feeds policies
-- Public can read feeds (for the alumni credentials showcase)
CREATE POLICY "Public can read alumni feeds" ON user_alumni_feeds FOR SELECT USING (true);
-- Only admins can manage alumni feeds (granting badges)
CREATE POLICY "Admins manage alumni feeds" ON user_alumni_feeds FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
