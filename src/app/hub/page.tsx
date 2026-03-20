'use client';

import { useState, useEffect } from 'react';
import { PodHub } from "../../components/PodHub";
import { InteractiveReader } from "../../components/InteractiveReader";
import { createClient } from '@/lib/supabase/client';
import { LessonData } from '@/components/SkillTree';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { CategoryData } from '../../components/PodHub';
import { LogOut, User, ShieldHalf, Sparkles } from 'lucide-react';
import { useGuestAuth } from '@/hooks/useGuestAuth';
import Link from 'next/link';
import { motion } from 'framer-motion';

import { Onboarding } from '../../components/Onboarding';

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
      
      // 2. Hydrate Hub via a Single RPC (Reduced Round-trips Logic)
      // This is Task 5: Hydration Optimisation
      const { data: hubData, error: hubErr } = await supabase
        .rpc('get_hydrated_hub', { p_user_id: currentUserId });

      if (hubErr) {
        console.error('Failed to fetch hydrated hub:', hubErr);
        setIsLoading(false);
        return;
      }

      if (hubData) {
        const { categories: catData, lessons: lessonData, prerequisites: prereqData, completed_ids, user_role } = hubData as any;
        
        const completedIds = new Set<string>(completed_ids || []);
        setIsAdmin(user_role === 'admin');
        setCategories(catData as CategoryData[]);

        // 3. Hydrate LessonData locally with complete state (Type-Safe Content Guards)
        const hydratedLessons: LessonData[] = (lessonData || []).map((lesson: any) => {
          const cat = catData.find((c: any) => c.id === lesson.category_id);
          const prereqs = (prereqData || [])
            .filter((p: any) => p.lesson_id === lesson.id)
            .map((p: any) => p.prerequisite_id);

          return {
            id: lesson.id || 'unknown-lesson',
            title: lesson.title || 'Untitled Lesson',
            category_id: lesson.category_id || '',
            category: cat?.name || 'Unknown',
            difficulty: lesson.difficulty || 'Level 1: Foundation',
            description: lesson.description || '',
            prerequisites: prereqs,
            completed: completedIds.has(lesson.id),
            content_slides: lesson.content_slides || [],
            convo_hooks: lesson.convo_hooks || [],
            reflection_prompt: lesson.reflection_prompt || 'What is your take?',
            position: lesson.position || 0,
            duration: lesson.duration || '',
            format: lesson.format || '',
            xp_reward: lesson.xp_reward || 0,
          };
        });

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
    // Validate guestId against local storage to prevent mismatched RPC migrations
    const localId = localStorage.getItem('guestId');
    if (guestId && localId && guestId !== localId) {
      console.warn('Guest ID mismatch detected. Favoring ephemeral session ID for accuracy.');
      // Update local storage to match the session if they drifted
      localStorage.setItem('guestId', guestId);
    }
    
    // Continue with natural navigation
  };


  if (isLoading) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin opacity-20" />
      </main>
    );
  }

  if (selectedLessonId) {
    // Find lesson by exact ID from hydrated lessons array
    const lesson = lessons.find((l) => l.id === selectedLessonId) || lessons[0];

    return (
      <main className="min-h-screen bg-black">
        <InteractiveReader 
          title={lesson.title}
          category={lesson.category}
          difficulty={lesson.difficulty}
          lessonData={lesson}
        />
      </main>
    );
  }

  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen flex items-center mb-24 justify-center bg-black relative overflow-x-hidden"
    >
      <div className="fixed top-6 right-6 md:top-10 md:right-10 z-50 flex items-center gap-2 md:gap-4">
        <Link 
          href="/account"
          className="p-3 text-white/20 hover:text-white hover:bg-white/5 rounded-full transition-all group backdrop-blur-md bg-black/20 border border-white/5"
          title="Personal Account"
        >
          <User className="w-5 h-5 group-hover:text-amber-200 transition-colors" />
        </Link>

        {isAdmin && (
          <Link 
            href="/admin"
            className="p-3 text-white/20 hover:text-white hover:bg-white/5 rounded-full transition-all group backdrop-blur-md bg-black/20 border border-white/5"
            title="Admin Hub"
          >
            <ShieldHalf className="w-5 h-5 group-hover:text-cyan-400 transition-colors" />
          </Link>
        )}

        <button 
          onClick={handleSignOut}
          className="p-3 text-white/20 hover:text-white hover:bg-white/5 rounded-full transition-all group backdrop-blur-md bg-black/20 border border-white/5"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5 group-hover:text-rose-500 transition-colors" />
        </button>
      </div>

      <PodHub 
        lessons={lessons} 
        categories={categories} 
        onSelectLesson={handleSelectLesson} 
        initialSelection={onboardingSelection}
      />

      {/* Guest Conversion Modal Overlay - Hub Level */}
      {isSignupRequired && (status === 'anonymous' || status === 'local') && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/98 px-6 animate-in fade-in duration-500 backdrop-blur-sm">
           <div className="w-full max-w-md p-10 bg-[#0d0d10] border border-white/5 rounded-sm shadow-2xl text-center flex flex-col items-center relative">
             <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4A017] to-transparent" />
             
             <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-8 border-b-4 border-zinc-300">
                <Sparkles className="w-7 h-7 text-black" />
             </div>
             
             <h2 className="text-3xl font-serif text-white mb-4 tracking-tight">You've had a taste!</h2>
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
                 onClick={handleSignOut}
                 className="block w-full py-4 text-white/20 hover:text-white transition-all text-[10px] font-bold tracking-[0.3em] uppercase"
               >
                 Exit Session
               </button>
             </div>
           </div>
        </div>
      )}
    </motion.main>
  );
}
