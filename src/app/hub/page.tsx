'use client';

import { useState, useEffect } from 'react';
import { InteractiveReader } from '../../components/InteractiveReader';
import { createClient } from '@/lib/supabase/client';
import { LessonData } from '@/components/SkillTree';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CategoryData } from '../../components/PodHub';
import { Sparkles } from 'lucide-react';
import { useGuestAuth } from '@/hooks/useGuestAuth';
import { HubStateProvider, useHubState } from '@/hooks/useHubState';
import Link from 'next/link';
import { motion } from 'framer-motion';

import { Onboarding } from '../../components/Onboarding';
import { StatusBar } from '../../components/hub/StatusBar';
import { CommandSidebar } from '../../components/hub/CommandSidebar';
import { ActivitySidebar } from '../../components/hub/ActivitySidebar';
import { HubCanvas } from '../../components/PodHub';

const supabase = createClient();

export default function HubPage() {
  const router = useRouter();
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [lessons, setLessons] = useState<LessonData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingSelection, setOnboardingSelection] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { status, guestId, isSignupRequired } = useGuestAuth();

  useEffect(() => {
    // Check onboarding status
    const hasSeen = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeen) {
      setShowOnboarding(true);
    }
    const savedSelection = localStorage.getItem('onboardingSelection');
    if (savedSelection) {
      setOnboardingSelection(savedSelection);
    }
    async function fetchHubData() {
      // 1. Get Session for User Identity
      const { data: { session } } = await supabase.auth.getSession();
      const currentUserId = session?.user?.id;
      setUserId(currentUserId ?? null);
      
      // 2. Hydrate Hub via a Single RPC (Reduced Round-trips Logic)
      const { data: hubData, error: hubErr } = await supabase
        .rpc('get_hydrated_hub', { p_user_id: currentUserId });

      if (hubErr) {
        console.error('Failed to fetch hydrated hub:', hubErr);
        setIsLoading(false);
        return;
      }

      if (hubData) {
        const { categories: catData, lessons: lessonData, prerequisites: prereqData, completed_ids, user_role } = hubData as Record<string, unknown>;
        
        const completedIds = new Set<string>((completed_ids as string[]) || []);
        setIsAdmin(user_role === 'admin');
        setCategories(catData as CategoryData[]);

        // 3. Hydrate LessonData locally with complete state
        const hydratedLessons: LessonData[] = ((lessonData as Array<Record<string, unknown>>) || []).map((lesson) => {
          const cat = (catData as CategoryData[]).find((c) => c.id === lesson.category_id);
          const prereqs = ((prereqData as Array<Record<string, unknown>>) || [])
            .filter((p) => p.lesson_id === lesson.id)
            .map((p) => p.prerequisite_id as string);

          return {
            id: (lesson.id as string) || 'unknown-lesson',
            title: (lesson.title as string) || 'Untitled Lesson',
            category_id: (lesson.category_id as string) || '',
            category_ids: (lesson.category_ids as string[]) || [],
            category: cat?.name || 'Unknown',
            difficulty: (lesson.difficulty as string) || 'Level 1: Foundation',
            description: (lesson.description as string) || '',
            prerequisites: prereqs,
            completed: completedIds.has(lesson.id as string),
            content_slides: (lesson.content_slides as Array<{ type: string; text: string }>) || [],
            convo_hooks: (lesson.convo_hooks as string[]) || [],
            reflection_prompt: (lesson.reflection_prompt as string) || 'What is your take?',
            position: (lesson.position as number) || 0,
            duration: (lesson.duration as string) || '',
            format: (lesson.format as string) || '',
            xp_reward: (lesson.xp_reward as number) || 0,
          };
        }).sort((a,b) => a.position - b.position);

        setLessons(hydratedLessons);
      }
      
      setIsLoading(false);
    }

    fetchHubData();
  }, [selectedLessonId]);

  const handleSelectLesson = (id: string) => {
    setSelectedLessonId(id);
  };

  const handleBackToHub = () => {
    setSelectedLessonId(null);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleSignupRedirect = (e: React.MouseEvent) => {
    // 4. Anonymous-to-Permanent Data Integrity Logic
    const localId = localStorage.getItem('guestId');
    if (guestId && localId && guestId !== localId) {
      console.warn('Guest ID mismatch detected. Favoring ephemeral session ID for accuracy.');
      localStorage.setItem('guestId', guestId);
    }
  };


  if (isLoading) {
    return (
      <main className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background Ambient Glow — Pulses with track-inspired colors */}
        <div className="absolute inset-0 bg-[#0d0d10]" />
        <motion.div 
           animate={{ 
             opacity: [0.05, 0.15, 0.05],
             scale: [1, 1.2, 1],
             background: [
               'radial-gradient(circle at 50% 50%, #52B788 0%, transparent 70%)',
               'radial-gradient(circle at 50% 50%, #4361EE 0%, transparent 70%)',
               'radial-gradient(circle at 50% 50%, #F59E0B 0%, transparent 70%)',
               'radial-gradient(circle at 50% 50%, #52B788 0%, transparent 70%)',
             ]
           }}
           transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
           className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] blur-[150px] rounded-full" 
        />
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 border border-white/5 bg-white/[0.02] rounded-full flex items-center justify-center mb-12 relative overflow-hidden">
             <div className="absolute inset-0 border border-white/10 rounded-full animate-ping opacity-20" />
             <Sparkles className="w-6 h-6 text-white/20" />
             <motion.div 
               animate={{ x: ['-100%', '200%'] }}
               transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
               className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12"
             />
          </div>
          
          <div className="space-y-4 text-center">
            <h1 className="text-[10px] font-bold tracking-[0.5em] uppercase text-white/10">Synchronising</h1>
            <div className="w-48 h-[2px] bg-white/5 rounded-full overflow-hidden relative">
              <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              />
            </div>
            <p className="text-[9px] font-medium tracking-[0.3em] uppercase text-white/5 animate-pulse italic">Mapping Intellectual Terrain...</p>
          </div>
        </div>

        {/* Decorative Skeletons */}
        <div className="absolute top-12 left-12 w-64 h-8 border border-white/5 rounded-full opacity-20 flex items-center px-4 gap-3">
           <div className="w-2 h-2 rounded-full bg-white/40" />
           <div className="w-24 h-1 bg-white/10 rounded-full" />
           <div className="ml-auto w-12 h-1 bg-white/10 rounded-full" />
        </div>
      </main>
    );
  }

  return (
    <HubStateProvider categories={categories} userId={userId}>
      {selectedLessonId ? (
        <main className="min-h-screen bg-black">
          <InteractiveReader 
            title={lessons.find(l => l.id === selectedLessonId)?.title || ''}
            category={lessons.find(l => l.id === selectedLessonId)?.category || ''}
            difficulty={lessons.find(l => l.id === selectedLessonId)?.difficulty || ''}
            lessonData={lessons.find(l => l.id === selectedLessonId) || lessons[0]}
            onClose={() => setSelectedLessonId(null)}
          />
        </main>
      ) : (
        <HubDashboard
          lessons={lessons}
          categories={categories}
          isAdmin={isAdmin}
          onSelectLesson={handleSelectLesson}
          onSignOut={handleSignOut}
          status={status}
          guestId={guestId}
          isSignupRequired={isSignupRequired}
          handleSignupRedirect={handleSignupRedirect}
          initialSelection={onboardingSelection}
          userId={userId}
        />
      )}
    </HubStateProvider>
  );
}

// ──────────────────────────────────────────────
// Inner Dashboard Component (wrapped in HubStateProvider)
// ──────────────────────────────────────────────

interface DashboardProps {
  lessons: LessonData[];
  categories: CategoryData[];
  isAdmin: boolean;
  onSelectLesson: (id: string) => void;
  onSignOut: () => void;
  status: string;
  guestId: string | null;
  isSignupRequired: boolean;
  handleSignupRedirect: (e: React.MouseEvent) => void;
  initialSelection: string | null;
  userId: string | null;
}

function HubDashboard({
  lessons,
  categories,
  isAdmin,
  onSelectLesson,
  onSignOut,
  status,
  guestId,
  isSignupRequired,
  handleSignupRedirect,
  initialSelection,
  userId,
}: DashboardProps) {
  const hub = useHubState();

  // Block lesson start if energy is 0
  const handleLessonStart = async (id: string) => {
    if (hub.energyUnits <= 0) return; // Block at node level before lesson loads
    const consumed = await hub.consumeEnergy();
    if (consumed) {
      onSelectLesson(id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-black flex flex-col overflow-hidden"
    >
      {/* Row 1: Status Bar */}
      <StatusBar
        energyUnits={hub.energyUnits}
        currentStreak={hub.currentStreak}
        mineralGrade={hub.mineralGrade}
        lastEnergyReset={hub.lastEnergyReset}
        lastLessonAt={hub.lastLessonAt}
        userId={userId}
        onToggleLeft={() => hub.setLeftOpen(!hub.isLeftOpen)}
        onToggleRight={() => hub.setRightOpen(!hub.isRightOpen)}
      />

      {/* Row 2: Tri-pane body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Command Sidebar */}
        <CommandSidebar
          categories={categories}
          lessons={lessons}
          visibleCategories={hub.visibleCategories}
          onToggleCategory={hub.toggleCategory}
          onSelectLesson={handleLessonStart}
          isOpen={hub.isLeftOpen}
          onClose={() => hub.setLeftOpen(false)}
          isAdmin={isAdmin}
          onSignOut={onSignOut}
        />

        {/* Centre: Learning Canvas */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
          <HubCanvas
            lessons={lessons}
            categories={categories}
            visibleCategories={hub.visibleCategories}
            onSelectLesson={handleLessonStart}
            initialSelection={initialSelection}
            energyUnits={hub.energyUnits}
          />
        </main>

        {/* Right: Activity Sidebar */}
        <ActivitySidebar
          isOpen={hub.isRightOpen}
          onClose={() => hub.setRightOpen(false)}
          isAnonymous={status === 'anonymous' || status === 'local'}
          guestId={guestId}
          completedLessonsCount={lessons.filter(l => l.completed).length}
        />
      </div>

      {/* Guest Conversion Modal Overlay */}
      {isSignupRequired && (status === 'anonymous' || status === 'local') && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/98 px-6 animate-in fade-in duration-500 backdrop-blur-sm">
           <div className="w-full max-w-md p-10 bg-[#0d0d10] border border-white/5 rounded-sm shadow-2xl text-center flex flex-col items-center relative">
             <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4A017] to-transparent" />
             
             <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-8 border-b-4 border-zinc-300">
                <Sparkles className="w-7 h-7 text-black" />
             </div>
             
             <h2 className="text-3xl font-serif text-white mb-4 tracking-tight">You&apos;ve had a taste!</h2>
             <p className="text-white/30 mb-12 leading-relaxed text-[11px] tracking-widest uppercase font-bold">
               Create a free account to keep going and save everything you have learned.
             </p>
             
             <div className="w-full space-y-6">
               <Link 
                  href={guestId ? `/signup?origin_guest_id=${guestId}` : "/signup"}
                  onClick={handleSignupRedirect}
                  className="block w-full py-5 bg-white text-black text-[11px] font-bold tracking-[0.25em] uppercase rounded-sm border-b-4 border-zinc-300 active:translate-y-px active:border-b-0 transition-all shadow-xl shadow-white/5"
                >
                  Create account
                </Link>
               <button 
                 onClick={onSignOut}
                 className="block w-full py-4 text-white/20 hover:text-white transition-all text-[10px] font-bold tracking-[0.3em] uppercase"
               >
                 Exit Session
               </button>
             </div>
           </div>
        </div>
      )}
    </motion.div>
  );
}
