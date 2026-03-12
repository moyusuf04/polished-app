import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export type UserStatus = 'loading' | 'anonymous' | 'authenticated' | 'unauthenticated' | 'local';

export function useGuestAuth() {
  const [status, setStatus] = useState<UserStatus>('loading');
  const [userId, setUserId] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<number>(0);
  const supabase = createClient();

  useEffect(() => {
    async function initializeAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setUserId(session.user.id);
        setStatus(session.user.is_anonymous ? 'anonymous' : 'authenticated');
      } else {
        // Automatically sign in anonymously if not signed in
        try {
          const { data, error } = await supabase.auth.signInAnonymously();
          if (error) throw error;
          if (data?.user) {
             setUserId(data.user.id);
             setStatus('anonymous');
          }
        } catch (error) {
          console.error('Failed to sign in anonymously, using local fallback:', error);
          let id = localStorage.getItem('guestId');
          if (!id) {
            id = crypto.randomUUID();
            localStorage.setItem('guestId', id);
          }
          setUserId(id);
          setStatus('local');
        }
      }

      // Load completed lessons count from local storage
      const lessonsCount = parseInt(localStorage.getItem('completed_lessons') || '0', 10);
      setCompletedLessons(lessonsCount);
    }

    initializeAuth();
  }, [supabase.auth]);

  const incrementLessons = () => {
    setCompletedLessons((prev) => {
      const newCount = prev + 1;
      localStorage.setItem('completed_lessons', newCount.toString());
      return newCount;
    });
  };

  const isSignupRequired = completedLessons >= 3 && (status === 'anonymous' || status === 'local');

  return {
    status,
    userId,
    completedLessons,
    incrementLessons,
    isSignupRequired
  };
}
