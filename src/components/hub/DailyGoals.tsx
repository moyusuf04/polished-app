'use client';

import { useState, useEffect } from 'react';
import { Check, Circle } from 'lucide-react';

/**
 * HARDCODED MVP — Daily Goals
 *
 * These goals are static placeholders.
 * TODO: Replace with dynamic Supabase-driven objectives before public launch.
 * The daily reset logic and localStorage persistence are production-ready.
 */

interface Goal {
  id: string;
  label: string;
  completed: boolean;
}

const DEFAULT_GOALS: Omit<Goal, 'completed'>[] = [
  { id: 'goal_1', label: 'Complete 1 lesson' },
  { id: 'goal_2', label: 'Write a reflection' },
  { id: 'goal_3', label: 'Explore a new track' },
];

const STORAGE_KEY = 'polished_daily_goals';

function getTodayKey(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;
}

function loadGoals(): Goal[] {
  if (typeof window === 'undefined') return DEFAULT_GOALS.map(g => ({ ...g, completed: false }));
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { day: string; goals: Goal[] };
      if (parsed.day === getTodayKey()) return parsed.goals;
    }
  } catch { /* ignore */ }
  return DEFAULT_GOALS.map(g => ({ ...g, completed: false }));
}

function saveGoals(goals: Goal[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    day: getTodayKey(),
    goals,
  }));
}

export function DailyGoals() {
  const [goals, setGoals] = useState<Goal[]>(loadGoals);

  // Re-check on mount in case the day changed while the tab was open
  useEffect(() => {
    setGoals(loadGoals());
  }, []);

  const toggleGoal = (id: string) => {
    setGoals((prev) => {
      const next = prev.map(g =>
        g.id === id ? { ...g, completed: !g.completed } : g
      );
      saveGoals(next);
      return next;
    });
  };

  const completedCount = goals.filter(g => g.completed).length;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/30">
          Daily Goals
        </h3>
        <span className="text-[9px] text-white/20 font-medium">
          {completedCount}/{goals.length}
        </span>
      </div>

      <div className="space-y-2.5">
        {goals.map((goal) => (
          <button
            key={goal.id}
            onClick={() => toggleGoal(goal.id)}
            className="w-full flex items-center gap-3 group text-left"
          >
            <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
              goal.completed
                ? 'bg-emerald-500/20 border-emerald-500/40'
                : 'border-white/10 group-hover:border-white/20'
            }`}>
              {goal.completed ? (
                <Check className="w-2.5 h-2.5 text-emerald-400" />
              ) : (
                <Circle className="w-2 h-2 text-white/10" />
              )}
            </div>
            <span className={`text-[11px] font-medium transition-colors ${
              goal.completed
                ? 'text-white/30 line-through'
                : 'text-white/60 group-hover:text-white/80'
            }`}>
              {goal.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
