-- =============================================================
-- Supabase Schema for Polished MVP + Admin Dashboard
-- =============================================================

-- =====================
-- CORE TABLES
-- =====================

-- Profiles (role-based access)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
  created_at timestamptz DEFAULT now()
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  theme_color text NOT NULL DEFAULT '#ffffff',
  deleted_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Lessons table (extended)
CREATE TABLE IF NOT EXISTS lessons (
  id text PRIMARY KEY,
  title text NOT NULL,
  category text NOT NULL,
  category_id uuid REFERENCES categories(id),
  difficulty text,
  description text,
  content_body text,
  content_slides jsonb,
  convo_hooks jsonb,
  thinking_prompt text,
  reflection_prompt text,
  status text DEFAULT 'draft' CHECK (status IN ('draft','published')),
  is_ai_generated boolean DEFAULT false,
  cover_image_url text,
  position int DEFAULT 0,
  duration text,
  format text,
  xp_reward int DEFAULT 0,
  deleted_at timestamptz,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Reflections
CREATE TABLE IF NOT EXISTS reflections (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id text REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  response_text text,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- User Progress
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id text NOT NULL,
  completed_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, lesson_id)
);

-- Admin Audit Logs
CREATE TABLE IF NOT EXISTS admin_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id uuid REFERENCES auth.users(id) NOT NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  details jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Lesson Versions (snapshot on every edit)
CREATE TABLE IF NOT EXISTS lesson_versions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id text NOT NULL,
  snapshot jsonb NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Lesson Prerequisites (graph edges)
CREATE TABLE IF NOT EXISTS lesson_prerequisites (
  lesson_id text NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  prerequisite_id text NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  PRIMARY KEY (lesson_id, prerequisite_id),
  CONSTRAINT no_self_dependency CHECK (lesson_id <> prerequisite_id)
);

-- =====================
-- ROW LEVEL SECURITY
-- =====================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_prerequisites ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can read all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Categories: public read (non-deleted), admin full access
CREATE POLICY "Public can read categories" ON categories FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Admins manage categories" ON categories FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Lessons: public read (published + non-deleted), admin full access
CREATE POLICY "Public can read published lessons" ON lessons FOR SELECT
USING (status = 'published' AND deleted_at IS NULL);
CREATE POLICY "Admins manage lessons" ON lessons FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Reflections
CREATE POLICY "Reflections are public" ON reflections FOR SELECT USING (true);
CREATE POLICY "Users can insert own reflections" ON reflections FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User Progress
CREATE POLICY "Users can read own progress" ON user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON user_progress FOR UPDATE USING (auth.uid() = user_id);

-- Admin Logs: admin only
CREATE POLICY "Admins manage logs" ON admin_logs FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Lesson Versions: admin only
CREATE POLICY "Admins manage versions" ON lesson_versions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Lesson Prerequisites: public read, admin write
CREATE POLICY "Public can read prerequisites" ON lesson_prerequisites FOR SELECT USING (true);
CREATE POLICY "Admins manage prerequisites" ON lesson_prerequisites FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- =====================
-- PERFORMANCE INDEXES
-- =====================

CREATE INDEX IF NOT EXISTS idx_lessons_category ON lessons(category_id);
CREATE INDEX IF NOT EXISTS idx_lessons_status ON lessons(status);
CREATE INDEX IF NOT EXISTS idx_lessons_deleted ON lessons(deleted_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_lessons_category_position ON lessons(category_id, position) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_prerequisites_lesson ON lesson_prerequisites(lesson_id);
CREATE INDEX IF NOT EXISTS idx_prerequisites_parent ON lesson_prerequisites(prerequisite_id);
CREATE INDEX IF NOT EXISTS idx_prerequisites_graph ON lesson_prerequisites(lesson_id, prerequisite_id);
CREATE INDEX IF NOT EXISTS idx_versions_lesson ON lesson_versions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at DESC);

-- =====================
-- CYCLE DETECTION FUNCTION
-- =====================

CREATE OR REPLACE FUNCTION check_no_cycle(p_lesson_id text, p_prereq_id text)
RETURNS boolean
LANGUAGE plpgsql AS $$
DECLARE found_cycle boolean;
BEGIN
  WITH RECURSIVE search_path(id) AS (
    SELECT prerequisite_id FROM lesson_prerequisites WHERE lesson_id = p_prereq_id
    UNION
    SELECT lp.prerequisite_id FROM lesson_prerequisites lp JOIN search_path sp ON lp.lesson_id = sp.id
  )
  SELECT EXISTS (SELECT 1 FROM search_path WHERE id = p_lesson_id) INTO found_cycle;
  RETURN NOT found_cycle;
END; $$;
