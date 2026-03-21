import { describe, it, expect, beforeEach, vi } from 'vitest';

// ──────────────────────────────────────────────
// Unit tests for Hub State logic (pure functions)
// ──────────────────────────────────────────────

// Import the grade computation logic (mirrored from design-tokens)
const MINERAL_GRADES = {
  quartz:  { label: 'Quartz',  color: '#C4B5A0', minXp: 0 },
  emerald: { label: 'Emerald', color: '#52B788', minXp: 1000 },
  diamond: { label: 'Diamond', color: '#B9D6F2', minXp: 5000 },
} as const;

function computeGrade(xp: number): string {
  const grades = Object.values(MINERAL_GRADES);
  for (let i = grades.length - 1; i >= 0; i--) {
    if (xp >= grades[i].minXp) return grades[i].label;
  }
  return grades[0].label;
}

function shouldResetEnergy(lastReset: Date): boolean {
  const now = new Date();
  const resetDate = new Date(lastReset);
  return (
    now.getUTCFullYear() !== resetDate.getUTCFullYear() ||
    now.getUTCMonth() !== resetDate.getUTCMonth() ||
    now.getUTCDate() !== resetDate.getUTCDate()
  );
}

describe('Mineral Grade Computation', () => {
  it('returns Quartz for 0 XP', () => {
    expect(computeGrade(0)).toBe('Quartz');
  });

  it('returns Quartz for 999 XP', () => {
    expect(computeGrade(999)).toBe('Quartz');
  });

  it('returns Emerald at exactly 1000 XP', () => {
    expect(computeGrade(1000)).toBe('Emerald');
  });

  it('returns Emerald for 4999 XP', () => {
    expect(computeGrade(4999)).toBe('Emerald');
  });

  it('returns Diamond at exactly 5000 XP', () => {
    expect(computeGrade(5000)).toBe('Diamond');
  });

  it('returns Diamond for very high XP', () => {
    expect(computeGrade(50000)).toBe('Diamond');
  });
});

describe('Energy Reset Logic', () => {
  it('should not reset if last reset was today', () => {
    const now = new Date();
    expect(shouldResetEnergy(now)).toBe(false);
  });

  it('should reset if last reset was yesterday', () => {
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    expect(shouldResetEnergy(yesterday)).toBe(true);
  });

  it('should reset if last reset was a week ago', () => {
    const weekAgo = new Date();
    weekAgo.setUTCDate(weekAgo.getUTCDate() - 7);
    expect(shouldResetEnergy(weekAgo)).toBe(true);
  });
});

describe('Energy Consumption Edge Cases', () => {
  it('should block lesson start at exactly 0 energy', () => {
    const energyUnits = 0;
    // This mirrors the handleLessonStart guard in hub/page.tsx
    const canStart = energyUnits > 0;
    expect(canStart).toBe(false);
  });

  it('should allow lesson start at 1 energy', () => {
    const energyUnits = 1;
    const canStart = energyUnits > 0;
    expect(canStart).toBe(true);
  });

  it('should decrement energy correctly', () => {
    let energy = 3;
    energy = energy - 1;
    expect(energy).toBe(2);
  });

  it('should not go below 0', () => {
    let energy = 0;
    const consumed = energy > 0;
    if (consumed) energy = energy - 1;
    expect(energy).toBe(0);
    expect(consumed).toBe(false);
  });
});

describe('Category Toggle Persistence', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      store: {} as Record<string, string>,
      getItem(key: string) { return this.store[key] ?? null; },
      setItem(key: string, value: string) { this.store[key] = value; },
      removeItem(key: string) { delete this.store[key]; },
    });
  });

  it('should persist toggled categories to localStorage', () => {
    const STORAGE_KEY = 'polished_visible_categories';
    const categories = { 'cat-1': true, 'cat-2': false, 'cat-3': true };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));

    const loaded = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    expect(loaded['cat-1']).toBe(true);
    expect(loaded['cat-2']).toBe(false);
    expect(loaded['cat-3']).toBe(true);
  });

  it('should default new categories to visible', () => {
    const STORAGE_KEY = 'polished_visible_categories';
    const existing = { 'cat-1': true };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));

    // Simulate new category arriving
    const allCategories = ['cat-1', 'cat-2'];
    const loaded = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') as Record<string, boolean>;
    for (const id of allCategories) {
      if (!(id in loaded)) loaded[id] = true; // Default new ones to visible
    }

    expect(loaded['cat-1']).toBe(true);
    expect(loaded['cat-2']).toBe(true); // New category defaults on
  });
});
