-- =============================================================
-- Migration: Evolved Hub - Multi-Category Support
-- Updates the hub hydration RPC to include hybrid node data
-- =============================================================

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
                SELECT 
                  l.id, 
                  l.title, 
                  l.category_id as primary_category_id,
                  -- Hybrid logic: gather all categories including junction entries
                  COALESCE(
                    (SELECT json_agg(category_id) FROM lesson_categories lc WHERE lc.lesson_id = l.id),
                    json_build_array(l.category_id)
                  ) as category_ids,
                  l.difficulty, 
                  l.description, 
                  l.content_slides, 
                  l.convo_hooks, 
                  l.reflection_prompt, 
                  l.position, 
                  l.duration, 
                  l.format, 
                  l.xp_reward
                FROM lessons l
                WHERE l.status = 'published' AND l.deleted_at IS NULL
                ORDER BY l.position ASC
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
