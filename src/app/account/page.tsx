'use client';

import AccountHeader from '@/components/account/AccountHeader';
import MineralTrackStatus from '@/components/account/MineralTrackStatus';
import { categoryToMineral } from '@/components/account/MineralTrackStatus';
import AlumniCredentials from '@/components/account/AlumniCredentials';
import type { AlumniEntry } from '@/components/account/AlumniCredentials';
import SpotlightArchive from '@/components/account/SpotlightArchive';
import type { ReflectionEntry } from '@/components/account/SpotlightArchive';
import IntelDropCustomiser from '@/components/account/IntelDropCustomiser';
import AccountErrorBoundary from '@/components/account/ErrorBoundary';
import Footer from '@/components/Footer';
import { useState, useEffect, useCallback, useOptimistic, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';
import { removeSavedLesson } from '@/actions/account-actions';
import { Loader2, X, Bookmark } from 'lucide-react';
import type { MineralKey } from '@/lib/design-tokens';
import { MINERALS } from '@/lib/design-tokens';
import { TOKENS } from '@/lib/design-tokens';

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

// Rank computation matching spec thresholds exactly
function computeRank(totalXp: number): string {
  if (totalXp >= 1800) return 'Rose Quartz';
  if (totalXp >= 1000) return 'Amethyst';
  if (totalXp >= 600)  return "Tiger's Eye";
  if (totalXp >= 300)  return 'Lapis Lazuli';
  if (totalXp >= 100)  return 'Malachite';
  return 'Obsidian';
}

const css = `
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes noiseShift {
    0%   { transform: translate3d(0, 0, 0); }
    25%  { transform: translate3d(-1px, 1px, 0); }
    50%  { transform: translate3d(1px, -1px, 0); }
    75%  { transform: translate3d(-1px, -1px, 0); }
    100% { transform: translate3d(0, 0, 0); }
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
    transform: translate3d(0, 0, 0);
    will-change: transform;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
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
  theme_color: string;
  completed: number;
  total: number;
}

interface SavedLessonEntry {
  id: string;
  lesson_id: string;
  lesson_title: string;
  category_name: string;
  category_color: string;
  created_at: string;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Saved Lessons Tab component
function SavedLessonsTab({ saves: initialSaves }: { saves: SavedLessonEntry[] }) {
  const [isPending, startTransition] = useTransition();
  const [optimisticSaves, updateOptimistic] = useOptimistic<SavedLessonEntry[], string>(
    initialSaves,
    (state, removedId) => state.filter((s) => s.id !== removedId)
  );
  const [errorId, setErrorId] = useState<string | null>(null);

  const handleUnsave = async (saveId: string) => {
    setErrorId(null);
    startTransition(() => updateOptimistic(saveId));
    const result = await removeSavedLesson(saveId);
    if (!result.success) {
      setErrorId(saveId);
    }
  };

  if (optimisticSaves.length === 0) {
    return (
      <p className="text-white/30 text-sm font-light">
        No saved lessons yet. Bookmark lessons from the Hub to see them here.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {optimisticSaves.map((save) => {
        const mineral = categoryToMineral(save.category_name);
        const m = MINERALS[mineral];
        return (
          <div
            key={save.id}
            className="group flex items-center justify-between p-4 border rounded-sm hover:bg-white/[0.02] transition-colors"
            style={{ borderColor: TOKENS.hairline }}
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-1 h-8 rounded-full shrink-0" style={{ backgroundColor: m.light }} />
              <div className="min-w-0">
                <p className="font-serif text-sm text-white/80 truncate">{save.lesson_title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] tracking-widest uppercase" style={{ color: m.light }}>{save.category_name}</span>
                  <span className="text-[10px] text-white/20">{formatDate(save.created_at)}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => handleUnsave(save.id)}
              disabled={isPending}
              className="text-white/30 hover:text-red-400 transition-colors shrink-0 opacity-0 group-hover:opacity-100 disabled:opacity-50"
              aria-label="Remove from saved"
            >
              <Bookmark className="w-4 h-4" fill="currentColor" />
            </button>
            {errorId === save.id && (
              <span className="text-[10px] text-red-400 ml-2">Failed</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function AccountPageContent() {
  const [userId, setUserId] = useState<string | null>(null);
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
  const [savedLessons, setSavedLessons] = useState<SavedLessonEntry[]>([]);
  const [alumniEntries, setAlumniEntries] = useState<AlumniEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'archive' | 'saved'>('archive');
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showError = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    async function fetchAccountData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          setIsLoading(false);
          return;
        }

        const currentUserId = session.user.id;
        setUserId(currentUserId);

        // Clean up legacy guest data immediately if authenticated
        if (!session.user.is_anonymous) {
          localStorage.removeItem('guestId');
          localStorage.removeItem('completed_lessons');
        }

        // Parallelise independent data fetches
        const [profileResult, refResult, progressResult, allLessonsResult, savedResult, alumniResult] = await Promise.all([
          // 1. Fetch profile
          supabase
            .from('profiles')
            .select('display_name, bio, avatar_url, rank')
            .eq('id', currentUserId)
            .single(),

          // 2. Fetch reflections with lesson info (including is_spotlighted)
          supabase
            .from('reflections')
            .select(`
              id,
              created_at,
              response_text,
              lesson_id,
              is_spotlighted,
              lessons!inner(title, category_id, xp_reward, categories!inner(name, theme_color))
            `)
            .eq('user_id', currentUserId)
            .order('created_at', { ascending: false }),

          // 3. Fetch user progress
          supabase
            .from('user_progress')
            .select('lesson_id, completed_at'),

          // 4. Fetch all published lessons
          supabase
            .from('lessons')
            .select('id, title, category_id, xp_reward, categories!inner(name, theme_color)')
            .eq('status', 'published')
            .is('deleted_at', null),

          // 5. Fetch saved lessons
          supabase
            .from('saved_lessons')
            .select('id, lesson_id, created_at, lessons!inner(title, categories!inner(name, theme_color))')
            .order('created_at', { ascending: false }),

          // 6. Fetch alumni feeds (completed lessons grouped)
          supabase
            .from('user_progress')
            .select('id, lesson_id, completed_at, lessons!inner(title, categories!inner(name))')
            .order('completed_at', { ascending: false }),
        ]);

        // Process profile
        if (profileResult.data) {
          const pd = profileResult.data as Record<string, unknown>;
          setProfile({
            display_name: (pd.display_name as string) || session.user.email?.split('@')[0] || '',
            bio: (pd.bio as string) || '',
            avatar_url: (pd.avatar_url as string) || '',
            rank: (pd.rank as string) || 'Obsidian',
          });
        }

        // Process reflections
        if (refResult.data) {
          const mapped: ReflectionEntry[] = refResult.data.map((r: Record<string, unknown>) => {
            const lesson = r.lessons as Record<string, unknown>;
            const category = lesson?.categories as Record<string, unknown>;
            return {
              id: r.id as string,
              created_at: r.created_at as string,
              response_text: r.response_text as string,
              lesson_id: r.lesson_id as string,
              lesson_title: (lesson?.title as string) || 'Unknown Lesson',
              category_name: (category?.name as string) || 'Unknown',
              category_color: (category?.theme_color as string) || '#ffffff',
              is_spotlighted: (r.is_spotlighted as boolean) || false,
            };
          });
          setReflections(mapped);
          setReflectionCount(mapped.length);
        }

        // Process saved lessons
        if (savedResult.data) {
          const mappedSaves: SavedLessonEntry[] = savedResult.data.map((s: Record<string, unknown>) => {
            const lesson = s.lessons as Record<string, unknown>;
            const category = lesson?.categories as Record<string, unknown>;
            return {
              id: s.id as string,
              lesson_id: s.lesson_id as string,
              lesson_title: (lesson?.title as string) || 'Unknown',
              category_name: (category?.name as string) || 'Unknown',
              category_color: (category?.theme_color as string) || '#ffffff',
              created_at: s.created_at as string,
            };
          });
          setSavedLessons(mappedSaves);
        }

        // Process alumni entries
        if (alumniResult.data) {
          const mappedAlumni: AlumniEntry[] = alumniResult.data.map((a: Record<string, unknown>) => {
            const lesson = a.lessons as Record<string, unknown>;
            const category = lesson?.categories as Record<string, unknown>;
            return {
              id: a.id as string,
              category_name: (category?.name as string) || 'Unknown',
              lesson_title: (lesson?.title as string) || 'Unknown',
              completed_at: a.completed_at as string,
            };
          });
          setAlumniEntries(mappedAlumni);
        }

        // Process progress + lessons for tracks
        const completedLessonIds = new Set(
          progressResult.data?.map((p: Record<string, unknown>) => p.lesson_id as string) || []
        );

        if (allLessonsResult.data) {
          const catMap = new Map<string, { name: string; theme_color: string; total: number; completed: number; xpEarned: number }>();

          allLessonsResult.data.forEach((lesson: Record<string, unknown>) => {
            const catId = lesson.category_id as string;
            const category = lesson.categories as Record<string, unknown>;
            const catName = (category?.name as string) || 'Unknown';
            const catColor = (category?.theme_color as string) || '#ffffff';
            const xp = (lesson.xp_reward as number) || 0;
            const isCompleted = completedLessonIds.has(lesson.id as string);

            if (!catMap.has(catId)) {
              catMap.set(catId, { name: catName, theme_color: catColor, total: 0, completed: 0, xpEarned: 0 });
            }
            const entry = catMap.get(catId)!;
            entry.total++;
            if (isCompleted) {
              entry.completed++;
              entry.xpEarned += xp;
            }
          });

          // Calculate total XP + tracks
          let xpSum = 0;
          const tracks: CategoryProgress[] = [];

          catMap.forEach((val) => {
            xpSum += val.xpEarned;
            // Do not render tracks for categories with zero published lessons
            if (val.total === 0) return;
            const progress = Math.round((val.completed / val.total) * 100);
            tracks.push({
              mineral: categoryToMineral(val.name),
              progress,
              title: val.name,
              theme_color: val.theme_color,
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

          // Check rank advancement
          const newRank = computeRank(xpSum);
          if (newRank !== profile.rank && profileResult.data) {
            await supabase
              .from('profiles')
              .update({ rank: newRank })
              .eq('id', currentUserId);
            setProfile(prev => ({ ...prev, rank: newRank }));
          }
        }
      } catch (err: unknown) {
        console.error('[AccountPage] Data fetch error:', err);
        showError('Failed to load account data. Please reload the page.');
      } finally {
        setIsLoading(false);
      }
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

  // Spotlighted reflections for the Intel Drop customiser
  const spotlightedReflections = reflections.filter(r => r.is_spotlighted);

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
        userId={userId || ''}
        onProfileUpdate={handleProfileUpdate}
        onError={showError}
      />
      <MineralTrackStatus
        categoryProgress={categoryProgress}
        rank={profile.rank}
        totalXp={totalXp}
      />
      <AlumniCredentials entries={alumniEntries} />

      {/* Tab Navigation */}
      <div className="px-6 relative z-10 pt-8">
        <div className="max-w-5xl mx-auto flex items-center gap-8">
          <button
            onClick={() => setActiveTab('archive')}
            className={`text-[10px] tracking-[0.2em] uppercase font-medium pb-2 border-b-2 transition-colors ${
              activeTab === 'archive' ? 'text-white border-white' : 'text-white/30 border-transparent hover:text-white/50'
            }`}
          >
            Spotlight Archive
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`text-[10px] tracking-[0.2em] uppercase font-medium pb-2 border-b-2 transition-colors ${
              activeTab === 'saved' ? 'text-white border-white' : 'text-white/30 border-transparent hover:text-white/50'
            }`}
          >
            Saved Lessons
            {savedLessons.length > 0 && (
              <span className="ml-2 text-white/20">{savedLessons.length}</span>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'archive' ? (
        <SpotlightArchive reflections={reflections} />
      ) : (
        <section className="py-16 px-6 relative z-10 border-b" style={{ borderColor: TOKENS.hairline }}>
          <div className="max-w-5xl mx-auto">
            <SavedLessonsTab saves={savedLessons} />
          </div>
        </section>
      )}

      <IntelDropCustomiser
        reflections={spotlightedReflections}
        displayName={profile.display_name}
      />

      <Footer />

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </main>
  );
}

export default function AccountPage() {
  return (
    <AccountErrorBoundary>
      <AccountPageContent />
    </AccountErrorBoundary>
  );
}
