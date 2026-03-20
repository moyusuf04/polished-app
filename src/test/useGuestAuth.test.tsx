import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useGuestAuth } from '@/hooks/useGuestAuth';

// Mock dependencies
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      signInAnonymously: vi.fn().mockResolvedValue({ data: { user: { id: 'anon-123' } } })
    },
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockResolvedValue({ data: [], count: 0, error: null })
  })
}));

describe('useGuestAuth Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should increment lessons and persist in local storage', async () => {
    const { result, rerender } = renderHook(() => useGuestAuth());
    
    // Wait for initial auth effect (in real life we await act)
    await act(async () => {
      await new Promise(r => setTimeout(r, 0));
    });

    expect(result.current.completedLessons).toBe(0);

    act(() => {
      result.current.incrementLessons();
    });

    expect(result.current.completedLessons).toBe(1);
    expect(localStorage.getItem('completed_lessons')).toBe('1');
    
    act(() => {
      result.current.incrementLessons();
      result.current.incrementLessons();
    });
    
    expect(result.current.completedLessons).toBe(3);
    
    rerender();
    
    // Because status was parsed to 'anonymous' in the mocked effect:
    expect(result.current.isSignupRequired).toBe(true);
  });
});
