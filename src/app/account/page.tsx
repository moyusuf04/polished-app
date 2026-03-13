'use client';

import AccountHeader from '@/components/account/AccountHeader';
import MineralTrackStatus from '@/components/account/MineralTrackStatus';
import { categoryToMineral } from '@/components/account/MineralTrackStatus';
import AlumniCredentials from '@/components/account/AlumniCredentials';
import SpotlightArchive from '@/components/account/SpotlightArchive';
import type { ReflectionEntry } from '@/components/account/SpotlightArchive';
import IntelDropCustomiser from '@/components/account/IntelDropCustomiser';
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader2, X } from 'lucide-react';
import type { MineralKey } from '@/lib/design-tokens';

const supabase = createClient();

// Minimal toast component
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-8 right-8 z-[200] max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="bg-red-900/90 border border-red-500/30 text-white px-5 py-4 rounded-sm shadow-2xl backdrop-blur-md flex items-start gap-3">
        <p className="text-sm font-light flex-1">{message}</p>
        <button onClick={onClose} className="text-white/50 hover:text-white transition-colors shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

const css = `
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes noiseShift {
    0%   { transform: translate(0,0); }
    25%  { transform: translate(-1px, 1px); }
    50%  { transform: translate(1px, -1px); }
    75%  { transform: translate(-1px, -1px); }
    100% { transform: translate(0,0); }
  }
  .polished-root {
    font-family: var(--font-sans), sans-serif;
    background: #000000;
    color: #e8e8e8;
    min-height: 100vh;
    overflow-x: hidden;
    position: relative;
  }
  .noise-overlay {
    position: fixed; inset: 0; pointer-events: none; z-index: 1; opacity: 0.035;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    animation: noiseShift 0.15s steps(1) infinite;
  }
  .scrollbar-thin::-webkit-scrollbar { width: 4px; }
  .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
  .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
`;

interface ProfileData {
  display_name: string;
  bio: string;
  avatar_url: string;
  rank: string;
}

interface CategoryProgress {
  mineral: MineralKey;
  progress: number;
  title: string;
  completed: number;
  total: number;
}

export default function AccountPage() {
  const [profile, setProfile] = useState<ProfileData>({
    display_name: '',
    bio: '',
    avatar_url: '',
    rank: 'Obsidian',
  });
  const [reflections, setReflections] = useState<ReflectionEntry[]>([]);
  const [categoryProgress, setCategoryProgress] = useState<CategoryProgress[]>([]);
  const [totalXp, setTotalXp] = useState(0);
  const [reflectionCount, setReflectionCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showError = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    async function fetchAccountData() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setIsLoading(false);
        return;
      }

      const userId = session.user.id;

      // 1. Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('display_name, bio, avatar_url, rank')
        .eq('id', userId)
        .single();

      if (profileData) {
        setProfile({
          display_name: profileData.display_name || session.user.email?.split('@')[0] || '',
          bio: profileData.bio || '',
          avatar_url: profileData.avatar_url || '',
          rank: profileData.rank || 'Obsidian',
        });
      }

      // 2. Fetch reflections with lesson info
      const { data: refData } = await supabase
        .from('reflections')
        .select(`
          id,
          created_at,
          response_text,
          lesson_id,
          lessons!inner(title, category_id, xp_reward, categories!inner(name))
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (refData) {
        const mapped: ReflectionEntry[] = refData.map((r: Record<string, unknown>) => {
          const lesson = r.lessons as Record<string, unknown>;
          const category = lesson?.categories as Record<string, unknown>;
          return {
            id: r.id as string,
            created_at: r.created_at as string,
            response_text: r.response_text as string,
            lesson_id: r.lesson_id as string,
            lesson_title: (lesson?.title as string) || 'Unknown Lesson',
            category_name: (category?.name as string) || 'Unknown',
          };
        });
        setReflections(mapped);
        setReflectionCount(mapped.length);
      }

      // 3. Fetch user progress + categories for track calculation
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('lesson_id')
        .eq('user_id', userId);

      const completedLessonIds = new Set(progressData?.map(p => p.lesson_id) || []);

      // 4. Fetch all published lessons grouped by category
      const { data: allLessons } = await supabase
        .from('lessons')
        .select('id, category_id, xp_reward, categories!inner(name)')
        .eq('status', 'published')
        .is('deleted_at', null);

      if (allLessons) {
        // Group lessons by category
        const catMap = new Map<string, { name: string; total: number; completed: number; xpEarned: number }>();

        allLessons.forEach((lesson: Record<string, unknown>) => {
          const catId = lesson.category_id as string;
          const category = lesson.categories as Record<string, unknown>;
          const catName = (category?.name as string) || 'Unknown';
          const xp = (lesson.xp_reward as number) || 0;
          const isCompleted = completedLessonIds.has(lesson.id as string);

          if (!catMap.has(catId)) {
            catMap.set(catId, { name: catName, total: 0, completed: 0, xpEarned: 0 });
          }
          const entry = catMap.get(catId)!;
          entry.total++;
          if (isCompleted) {
            entry.completed++;
            entry.xpEarned += xp;
          }
        });

        // Calculate total XP
        let xpSum = 0;
        const tracks: CategoryProgress[] = [];

        catMap.forEach((val) => {
          xpSum += val.xpEarned;
          const progress = val.total > 0 ? Math.round((val.completed / val.total) * 100) : 0;
          tracks.push({
            mineral: categoryToMineral(val.name),
            progress,
            title: val.name,
            completed: val.completed,
            total: val.total,
          });
        });

        // Sort: in-progress first, then completed, then empty
        tracks.sort((a, b) => {
          if (a.progress > 0 && a.progress < 100 && !(b.progress > 0 && b.progress < 100)) return -1;
          if (b.progress > 0 && b.progress < 100 && !(a.progress > 0 && a.progress < 100)) return 1;
          return b.progress - a.progress;
        });

        setCategoryProgress(tracks);
        setTotalXp(xpSum);

        // 5. Check rank advancement
        const ranks = [
          { threshold: 2500, label: 'Rose Quartz' },
          { threshold: 2000, label: "Tiger's Eye" },
          { threshold: 1500, label: 'Amethyst' },
          { threshold: 1000, label: 'Lapis' },
          { threshold: 500, label: 'Malachite' },
          { threshold: 0, label: 'Obsidian' },
        ];
        const newRank = ranks.find(r => xpSum >= r.threshold)?.label || 'Obsidian';

        if (newRank !== profile.rank && profileData) {
          await supabase
            .from('profiles')
            .update({ rank: newRank })
            .eq('id', userId);
          setProfile(prev => ({ ...prev, rank: newRank }));
        }
      }

      // 6. Clean up any legacy guest data
      localStorage.removeItem('guestId');
      localStorage.removeItem('completed_lessons');

      setIsLoading(false);
    }

    fetchAccountData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleProfileUpdate = (updated: { display_name: string; bio: string; avatar_url: string }) => {
    setProfile(prev => ({ ...prev, ...updated }));
  };

  if (isLoading) {
    return (
      <main className="polished-root flex items-center justify-center">
        <style dangerouslySetInnerHTML={{ __html: css }} />
        <Loader2 className="w-8 h-8 text-white/10 animate-spin" />
      </main>
    );
  }

  return (
    <main className="polished-root selection:bg-zinc-800">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="noise-overlay" />

      <AccountHeader
        insightsProvided={reflectionCount}
        initialProfile={{
          display_name: profile.display_name,
          bio: profile.bio,
          avatar_url: profile.avatar_url,
        }}
        onProfileUpdate={handleProfileUpdate}
        onError={showError}
      />
      <MineralTrackStatus
        categoryProgress={categoryProgress}
        rank={profile.rank}
        totalXp={totalXp}
      />
      <AlumniCredentials />
      <SpotlightArchive reflections={reflections} />
      <IntelDropCustomiser
        reflections={reflections}
        displayName={profile.display_name}
      />

      <div className="pb-32" />

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </main>
  );
}
