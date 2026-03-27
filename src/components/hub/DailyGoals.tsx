'use client';

import { useState, useEffect } from 'react';
import { Check, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const progressPercent = (completedCount / goals.length) * 100;
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-sm p-4 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-2 opacity-50 group-hover:opacity-100 transition-opacity">
        <svg className="w-10 h-10 -rotate-90">
          <circle
            cx="20" cy="20" r={radius}
            fill="transparent"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="3"
          />
          <motion.circle
            cx="20" cy="20" r={radius}
            fill="transparent"
            stroke={completedCount === goals.length ? '#52B788' : '#D4A017'}
            strokeWidth="3"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/30">
          Daily Goals
        </h3>
        <span className="text-[9px] text-white/20 font-medium z-10">
          {completedCount}/{goals.length}
        </span>
      </div>

      <div className="space-y-4 relative z-10">
        {goals.map((goal) => {
          const isDone = goal.completed;
          return (
            <button
              key={goal.id}
              onClick={() => toggleGoal(goal.id)}
              className="w-full flex items-center gap-4 group text-left relative"
            >
              <div className="relative w-5 h-5 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="10" cy="10" r="8"
                    fill="transparent"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="1.5"
                  />
                  <motion.circle
                    cx="10" cy="10" r="8"
                    fill="transparent"
                    stroke={isDone ? '#52B788' : 'rgba(212, 160, 23, 0.3)'}
                    strokeWidth="2"
                    strokeDasharray={2 * Math.PI * 8}
                    initial={{ strokeDashoffset: 2 * Math.PI * 8 }}
                    animate={{ strokeDashoffset: isDone ? 0 : 2 * Math.PI * 8 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    strokeLinecap="round"
                  />
                </svg>
                {isDone && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center placeholder-node"
                  >
                    <Check className="w-2 h-2 text-emerald-400" />
                    
                    {/* XP Particles Burst */}
                    <AnimatePresence>
                      <div className="absolute inset-x-0 bottom-full h-12 pointer-events-none overflow-visible">
                        {[...Array(6)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                            animate={{ 
                              x: (i - 2.5) * 15, 
                              y: -40 - (Math.random() * 40), 
                              opacity: 0, 
                              scale: 0.5 
                            }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="absolute left-1/2 bottom-0 w-1 h-1 rounded-full bg-[#D4A017] shadow-[0_0_8px_#D4A017]"
                          />
                        ))}
                      </div>
                    </AnimatePresence>
                  </motion.div>
                )}
              </div>

              <span className={`text-[11px] font-medium transition-all duration-500 ${
                isDone
                  ? 'text-white/20 italic'
                  : 'text-white/60 group-hover:text-white/90'
              }`}>
                {goal.label}
              </span>
            </button>
          );
        })}
      </div>
      
      <AnimatePresence>
        {completedCount === goals.length && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 pt-4 border-t border-white/5 relative overflow-hidden"
          >
            <motion.div 
               initial={{ opacity: 0, scale: 0 }}
               animate={{ opacity: [0, 0.4, 0], scale: [0, 1.5, 2] }}
               transition={{ duration: 1.5, ease: "easeOut" }}
               className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full"
            />
            
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                 <span className="text-[9px] font-bold tracking-[0.2em] text-emerald-400 uppercase">Day Perfected</span>
               </div>
               <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500/40">+ ENERGY REFILL</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
