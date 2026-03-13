-- =============================================================
-- Migration: Anonymous-to-Permanent Account Bridge
-- Created: 2026-03-12
-- =============================================================

-- =====================
-- FUNCTION: migrate_guest_data
-- Atomically transfers all guest data (reflections, progress)
-- to the new permanent user ID. Used as a fallback for the
-- 'local' guest mode when anonymous Supabase auth failed.
-- For standard anonymous auth users, Supabase handles the
-- user ID promotion automatically via auth.updateUser().
-- =====================
CREATE OR REPLACE FUNCTION migrate_guest_data(
  new_user_id UUID,
  guest_id TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate that the caller is the authenticated user
  IF auth.uid() != new_user_id THEN
    RAISE EXCEPTION 'Unauthorized: caller does not match new_user_id';
  END IF;

  -- Transfer reflections
  UPDATE reflections
  SET user_id = new_user_id
  WHERE user_id::text = guest_id;

  -- Transfer progress records, ignoring duplicates (lesson already completed as permanent user)
  INSERT INTO user_progress (user_id, lesson_id, completed_at)
  SELECT new_user_id, lesson_id, completed_at
  FROM user_progress
  WHERE user_id::text = guest_id
  ON CONFLICT (user_id, lesson_id) DO NOTHING;

  -- Remove the old guest progress records after migration
  DELETE FROM user_progress
  WHERE user_id::text = guest_id;

  -- Ensure a profile row exists for the new permanent user
  INSERT INTO profiles (id, role)
  VALUES (new_user_id, 'user')
  ON CONFLICT (id) DO NOTHING;
END;
$$;

-- =====================
-- RLS POLICY UPDATES
-- Allow the migrate_guest_data function (SECURITY DEFINER)
-- to update reflections and user_progress freely.
-- The function itself enforces caller identity.
-- We also add an explicit UPDATE policy so authenticated
-- users can reclaim their own guest records during the
-- signup window on the client side if needed.
-- =====================

-- Allow authenticated users to update reflections they "own"
-- (i.e., their guest UUID was stored as the user_id text)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'reflections'
    AND policyname = 'Users can update own reflections for migration'
  ) THEN
    CREATE POLICY "Users can update own reflections for migration"
    ON reflections FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Allow authenticated users to delete their own progress
-- (needed during guest data cleanup post-migration)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'user_progress'
    AND policyname = 'Users can delete own progress'
  ) THEN
    CREATE POLICY "Users can delete own progress"
    ON user_progress FOR DELETE
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION migrate_guest_data(UUID, TEXT) TO authenticated;
