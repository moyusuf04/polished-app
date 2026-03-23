-- =============================================================
-- Migration: Streak Improvements & RPCs
-- Created: 2026-03-23
-- =============================================================

-- 1. sync_user_streak(p_user_id)
-- Recalculates the current streak based on user_progress.
-- A streak is continuous days of at least one completion.
CREATE OR REPLACE FUNCTION sync_user_streak(p_user_id UUID)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_streak INT := 0;
  v_last_date DATE;
  v_current_date DATE := (CURRENT_TIMESTAMP AT TIME ZONE 'UTC')::DATE;
BEGIN
  -- Get the most recent completion date
  SELECT MAX(completed_at::DATE) INTO v_last_date
  FROM user_progress
  WHERE user_id = p_user_id
  AND completed_at::DATE <= v_current_date;

  -- If no completions ever, or last completion was more than 1 day ago, streak is 0
  -- Note: if today is Monday and last completion was Sunday, streak is still alive.
  -- If today is Monday and last completion was Saturday, streak is dead.
  IF v_last_date IS NULL OR v_last_date < (v_current_date - 1) THEN
    UPDATE profiles SET current_streak = 0 WHERE id = p_user_id;
    RETURN 0;
  END IF;

  -- Calculate consecutive days counting back from the most recent completion
  WITH daily_completions AS (
    SELECT DISTINCT completed_at::DATE as day
    FROM user_progress
    WHERE user_id = p_user_id
    AND completed_at::DATE <= v_current_date
    ORDER BY day DESC
  ),
  streak_calc AS (
    SELECT 
      day,
      day - (ROW_NUMBER() OVER (ORDER BY day DESC))::INT as group_id
    FROM daily_completions
  )
  SELECT COUNT(*) INTO v_streak
  FROM streak_calc
  WHERE group_id = (
    SELECT group_id FROM streak_calc WHERE day = v_last_date LIMIT 1
  );

  UPDATE profiles SET current_streak = v_streak WHERE id = p_user_id;
  RETURN v_streak;
END;
$$;

-- 2. get_streak_history(p_user_id, p_days)
-- Returns a list of dates within the last X days where the user was active.
CREATE OR REPLACE FUNCTION get_streak_history(p_user_id UUID, p_days INT DEFAULT 30)
RETURNS TABLE(active_date DATE)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT completed_at::DATE
  FROM user_progress
  WHERE user_id = p_user_id
  AND completed_at >= (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - (p_days || ' days')::INTERVAL)
  ORDER BY completed_at DESC;
END;
$$;
