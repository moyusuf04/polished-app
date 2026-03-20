-- =============================================================
-- Migration: Advanced Progression and Validation Hardening
-- Created: 2026-03-20
-- =============================================================

-- 1. Atomic Progress Tracking Trigger
-- Ensures a user_progress record can only be created if all prerequisites are met.
CREATE OR REPLACE FUNCTION check_prerequisites_before_progress()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  unmet_prereq_count INT;
BEGIN
  -- Count how many prerequisites for this lesson are NOT in the user's completed list
  SELECT count(*)
  INTO unmet_prereq_count
  FROM lesson_prerequisites lp
  WHERE lp.lesson_id = NEW.lesson_id
    AND lp.prerequisite_id NOT IN (
      SELECT lesson_id 
      FROM user_progress 
      WHERE user_id = NEW.user_id
    );

  IF unmet_prereq_count > 0 THEN
    RAISE EXCEPTION 'Cannot complete lesson: prerequisites not met';
  END IF;

  RETURN NEW;
END;
$$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'enforce_prerequisites') THEN
    CREATE TRIGGER enforce_prerequisites
    BEFORE INSERT ON user_progress
    FOR EACH ROW
    EXECUTE FUNCTION check_prerequisites_before_progress();
  END IF;
END $$;

-- 2. Auth Bridge Validation
-- Harden the migrate_guest_data RPC to perform strict validation.
CREATE OR REPLACE FUNCTION public.migrate_guest_data(
    new_user_id uuid,
    guest_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Validate that the caller is the authenticated user
  IF auth.uid() != new_user_id THEN
    RAISE EXCEPTION 'Unauthorized: caller does not match new_user_id';
  END IF;

  -- Validate guest_id is a properly formatted UUID to prevent injection/abuse
  IF guest_id !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' THEN
    RAISE EXCEPTION 'Invalid guest ID format';
  END IF;

  -- Prevent transferring data FROM an existing permanent user
  IF EXISTS (SELECT 1 FROM profiles WHERE id::text = guest_id AND role != 'guest') THEN
    RAISE EXCEPTION 'Cannot migrate data from a permanent account';
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
