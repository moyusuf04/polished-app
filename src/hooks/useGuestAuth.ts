import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export type UserStatus = 'loading' | 'anonymous' | 'authenticated' | 'unauthenticated' | 'local';

export function useGuestAuth() {
  const [status, setStatus] = useState<UserStatus>('loading');
  const [userId, setUserId] = useState<string | null>(null);
  const [guestId, setGuestId] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<number>(0);
  const supabase = createClient();

  useEffect(() => {
    async function initializeAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      let currentUserId: string | null = null;
      let currentStatus: UserStatus = 'loading';
      
      if (session) {
        currentUserId = session.user.id;
        currentStatus = session.user.is_anonymous ? 'anonymous' : 'authenticated';
      } else {
        // Automatically sign in anonymously if not signed in
        try {
          const { data, error } = await supabase.auth.signInAnonymously();
          if (error) throw error;
          if (data?.user) {
             currentUserId = data.user.id;
             currentStatus = 'anonymous';
          }
        } catch (error) {
          console.error('Failed to sign in anonymously, using local fallback:', error);
          let id = localStorage.getItem('guestId');
          if (!id) {
            id = crypto.randomUUID();
            localStorage.setItem('guestId', id);
          }
          currentUserId = id;
          currentStatus = 'local';
        }
      }

      setUserId(currentUserId);
      setGuestId(currentUserId); // In guest mode, userId acts as guestId
      setStatus(currentStatus);

      // Load completed lessons count
      // If anonymous, try to get real count from DB first
      if (currentStatus === 'anonymous' && currentUserId) {
        const { count, error } = await supabase
          .from('user_progress')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', currentUserId);
        
        if (!error && count !== null) {
          setCompletedLessons(count);
          localStorage.setItem('completed_lessons', count.toString());
          return;
        }
      }

      // Fallback to local storage
      const lessonsCount = parseInt(localStorage.getItem('completed_lessons') || '0', 10);
      setCompletedLessons(lessonsCount);
    }

    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const incrementLessons = () => {
    setCompletedLessons((prev) => {
      const newCount = prev + 1;
      localStorage.setItem('completed_lessons', newCount.toString());
      return newCount;
    });
  };

  const isSignupRequired = completedLessons >= 3 && (status === 'anonymous' || status === 'local');

  /**
   * Clears all local guest state after successful migration to a permanent account.
   * Call this after the migrate_guest_data RPC returns successfully.
   */
  const clearGuestData = () => {
    localStorage.removeItem('guestId');
    localStorage.removeItem('completed_lessons');
    setGuestId(null);
    setCompletedLessons(0);
  };

  return {
    status,
    userId,
    guestId,
    completedLessons,
    incrementLessons,
    clearGuestData,
    isSignupRequired
  };
}
