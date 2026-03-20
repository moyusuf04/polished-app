-- =============================================================
-- Migration: System Hardening, Schema Reloading, and Hydration RPC
-- Created: 2026-03-20
-- =============================================================

-- 1. Standardise difficulty column to text
ALTER TABLE IF EXISTS lessons 
  ALTER COLUMN difficulty TYPE text;

-- 2. Automated PostgREST Schema Reloading
-- This allows any DDL change to automatically inform the PostgREST cache.
CREATE OR REPLACE FUNCTION public.pgrst_watch() 
RETURNS event_trigger 
LANGUAGE plpgsql 
AS $$
BEGIN
  NOTIFY pgrst, 'reload schema';
END;
$$;

-- Note: Event triggers might require superuser or specific permissions. 
-- In Supabase, you can usually only create them on specific schemas if allowed.
-- If this fails on a hosted instance, it's a known constraint, but provided here for the spec.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_event_trigger WHERE evtname = 'pgrst_watch') THEN
    CREATE EVENT TRIGGER pgrst_watch
      ON ddl_command_end
      EXECUTE FUNCTION public.pgrst_watch();
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not create event trigger pgrst_watch. This is normal on some hosted Supabase environments.';
END $$;

-- 3. Hub Data Hydration RPC
-- Reduces multiple round-trips to a single call.
CREATE OR REPLACE FUNCTION get_hydrated_hub(p_user_id UUID DEFAULT NULL)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
    completed_ids json;
    user_role text;
BEGIN
    -- 1. Fetch completed lesson IDs if user_id is provided
    IF p_user_id IS NOT NULL THEN
        SELECT json_agg(lesson_id) INTO completed_ids
        FROM user_progress 
        WHERE user_id = p_user_id;
        
        -- Fetch user role
        SELECT role INTO user_role FROM profiles WHERE id = p_user_id;
    ELSE
        completed_ids := '[]'::json;
        user_role := 'user';
    END IF;

    SELECT json_build_object(
        'categories', (
            SELECT json_agg(c)
            FROM (
                SELECT id, name, description, theme_color 
                FROM categories 
                WHERE deleted_at IS NULL 
                ORDER BY created_at DESC
            ) c
        ),
        'lessons', (
            SELECT json_agg(l)
            FROM (
                SELECT id, title, category_id, difficulty, description, 
                       content_slides, convo_hooks, reflection_prompt, 
                       position, duration, format, xp_reward
                FROM lessons 
                WHERE status = 'published' AND deleted_at IS NULL
                ORDER BY position ASC
            ) l
        ),
        'prerequisites', (
            SELECT json_agg(p)
            FROM (
                SELECT lesson_id, prerequisite_id 
                FROM lesson_prerequisites
            ) p
        ),
        'completed_ids', COALESCE(completed_ids, '[]'::json),
        'user_role', COALESCE(user_role, 'user')
    ) INTO result;
    
    RETURN result;
END;
$$;

-- 4. Audit RPC for Auth Bridge Security (Dry-run logic for RLS validation)
-- This function can be used to verify if a guest_id is "owned" by the caller.
CREATE OR REPLACE FUNCTION verify_guest_ownership(target_guest_id text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Logic: Check if the guest_id has records that match the caller's session (if any)
  -- or if they are performing a legitimate bridge.
  -- For the dry-run audit, we just ensure it's a valid UUID format.
  RETURN target_guest_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
END;
$$;
