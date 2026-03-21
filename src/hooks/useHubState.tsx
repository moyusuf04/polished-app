'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MINERAL_GRADES } from '@/lib/design-tokens';
import type { CategoryData } from '@/components/PodHub';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface ProfileData {
  energy_units: number;
  current_streak: number;
  last_lesson_at: string | null;
  last_energy_reset: string | null;
}

interface HubState {
  /** Category visibility – defaults all-on. Persisted in localStorage. */
  visibleCategories: Record<string, boolean>;
  /** Remaining daily energy units. */
  energyUnits: number;
  /** Current daily streak count. */
  currentStreak: number;
  /** Simplified 3-tier grade: Quartz / Emerald / Diamond */
  mineralGrade: string;
  /** Total XP from completed lessons. */
  totalXp: number;
  /** Mobile left drawer state. */
  isLeftOpen: boolean;
  /** Mobile right drawer state. */
  isRightOpen: boolean;
  /** Timestamp of last energy reset for time-until-recharge calculation. */
  lastEnergyReset: Date;
  /** Whether a profile has been loaded from Supabase. */
  isLoaded: boolean;
  /** Toggle a category on/off in the canvas. */
  toggleCategory: (categoryId: string) => void;
  /** Consume one energy unit. Returns false if already at 0. */
  consumeEnergy: () => Promise<boolean>;
  /** Refresh profile data from Supabase. */
  refreshProfile: () => Promise<void>;
  /** Returns hours remaining until energy reset. */
  getTimeUntilReset: () => number;
  /** Set left drawer open/closed. */
  setLeftOpen: (open: boolean) => void;
  /** Set right drawer open/closed. */
  setRightOpen: (open: boolean) => void;
}

const HubStateContext = createContext<HubState | null>(null);

const STORAGE_KEY = 'polished_visible_categories';
const ENERGY_MAX = 5;

// ──────────────────────────────────────────────
// Helper: get mineral grade from XP (client-side mirror)
// ──────────────────────────────────────────────
function computeGrade(xp: number): string {
  const grades = Object.values(MINERAL_GRADES);
  // Descending order by minXp
  for (let i = grades.length - 1; i >= 0; i--) {
    if (xp >= grades[i].minXp) return grades[i].label;
  }
  return grades[0].label;
}

// ──────────────────────────────────────────────
// Helper: check if energy should auto-reset (client-side fallback)
// ──────────────────────────────────────────────
function shouldResetEnergy(lastReset: Date): boolean {
  const now = new Date();
  const resetDate = new Date(lastReset);
  // Reset if the last reset was on a different calendar day (UTC)
  return (
    now.getUTCFullYear() !== resetDate.getUTCFullYear() ||
    now.getUTCMonth() !== resetDate.getUTCMonth() ||
    now.getUTCDate() !== resetDate.getUTCDate()
  );
}

// ──────────────────────────────────────────────
// Provider
// ──────────────────────────────────────────────

interface HubStateProviderProps {
  children: React.ReactNode;
  categories: CategoryData[];
  userId: string | null;
}

export function HubStateProvider({ children, categories, userId }: HubStateProviderProps) {
  const supabase = createClient();

  // Category visibility – default all-on
  const [visibleCategories, setVisibleCategories] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved) as Record<string, boolean>;
    } catch { /* ignore */ }
    return {};
  });

  // Profile state
  const [energyUnits, setEnergyUnits] = useState(ENERGY_MAX);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [totalXp, setTotalXp] = useState(0);
  const [lastEnergyReset, setLastEnergyReset] = useState(new Date());
  const [isLoaded, setIsLoaded] = useState(false);

  // Mobile drawer state
  const [isLeftOpen, setLeftOpen] = useState(false);
  const [isRightOpen, setRightOpen] = useState(false);

  // Derive mineral grade
  const mineralGrade = useMemo(() => computeGrade(totalXp), [totalXp]);

  // ── Ensure new categories default to visible ──
  useEffect(() => {
    if (categories.length === 0) return;
    setVisibleCategories((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const cat of categories) {
        if (!(cat.id in next)) {
          next[cat.id] = true;
          changed = true;
        }
      }
      if (!changed) return prev;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, [categories]);

  // ── Fetch profile data ──
  const refreshProfile = useCallback(async () => {
    if (!userId) {
      setIsLoaded(true);
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('energy_units, current_streak, last_lesson_at, last_energy_reset')
      .eq('id', userId)
      .single();

    if (profile) {
      const p = profile as ProfileData;
      const resetDate = p.last_energy_reset ? new Date(p.last_energy_reset) : new Date();
      setLastEnergyReset(resetDate);

      // Client-side energy reset check
      if (shouldResetEnergy(resetDate)) {
        setEnergyUnits(ENERGY_MAX);
        // Persist the reset back to Supabase
        await supabase
          .from('profiles')
          .update({ energy_units: ENERGY_MAX, last_energy_reset: new Date().toISOString() })
          .eq('id', userId);
        setLastEnergyReset(new Date());
      } else {
        setEnergyUnits(p.energy_units ?? ENERGY_MAX);
      }

      setCurrentStreak(p.current_streak ?? 0);
    }

    // Fetch total XP
    const { data: xpData } = await supabase.rpc('mineral_grade', { p_user_id: userId });
    // Also compute total XP client-side for the number
    const { data: progressData } = await supabase
      .from('user_progress')
      .select('lessons(xp_reward)')
      .eq('user_id', userId);

    if (progressData) {
      const xp = (progressData as unknown as Array<{ lessons: { xp_reward: number } | null }>)
        .reduce((sum, row) => sum + (row.lessons?.xp_reward ?? 0), 0);
      setTotalXp(xp);
    }

    setIsLoaded(true);
  }, [userId, supabase]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  // ── Actions ──
  const toggleCategory = useCallback((categoryId: string) => {
    setVisibleCategories((prev) => {
      const next = { ...prev, [categoryId]: !prev[categoryId] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const consumeEnergy = useCallback(async (): Promise<boolean> => {
    if (energyUnits <= 0) return false;

    const newEnergy = energyUnits - 1;
    setEnergyUnits(newEnergy);

    if (userId) {
      await supabase
        .from('profiles')
        .update({
          energy_units: newEnergy,
          last_lesson_at: new Date().toISOString(),
        })
        .eq('id', userId);
    }

    return true;
  }, [energyUnits, userId, supabase]);

  const getTimeUntilReset = useCallback((): number => {
    const now = new Date();
    // Next midnight UTC
    const nextReset = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1,
      0, 0, 0
    ));
    const diffMs = nextReset.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60))); // hours
  }, []);

  const value: HubState = {
    visibleCategories,
    energyUnits,
    currentStreak,
    mineralGrade,
    totalXp,
    isLeftOpen,
    isRightOpen,
    lastEnergyReset,
    isLoaded,
    toggleCategory,
    consumeEnergy,
    refreshProfile,
    getTimeUntilReset,
    setLeftOpen,
    setRightOpen,
  };

  return (
    <HubStateContext.Provider value={value}>
      {children}
    </HubStateContext.Provider>
  );
}

// ──────────────────────────────────────────────
// Hook
// ──────────────────────────────────────────────

export function useHubState(): HubState {
  const ctx = useContext(HubStateContext);
  if (!ctx) throw new Error('useHubState must be used within a HubStateProvider');
  return ctx;
}
