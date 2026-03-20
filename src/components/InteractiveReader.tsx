'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Lightbulb, X, Sparkles, Loader2, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLessonSlides } from '@/hooks/useLessonSlides';
import { useGuestAuth } from '@/hooks/useGuestAuth';
import { createClient } from '@/lib/supabase/client';
import { ReflectionBox } from './ReflectionBox';
import { DiscussionFeed } from './DiscussionFeed';
import { SaveButton } from './shared/SaveButton';

type ReaderState = 'READING' | 'REFLECTING' | 'REVEALED';

interface Props {
  title: string;
  category: string;
  difficulty: string;
  lessonData: {
    id: string;
    content_slides: { type: string; text: string; title?: string }[];
    convo_hooks: string[];
    reflection_prompt: string;
  };
}

const dopamineCues = [
  "Nice start",
  "Interesting point",
  "Almost there",
  "Conversational ammo",
  "Final step"
];

export function InteractiveReader({ title, category, difficulty, lessonData }: Props) {
  const router = useRouter();
  const contentSlides = lessonData.content_slides || [];
  const {
    currentSlide,
    totalSlides,
    isHooksSlide,
    isFinalSlide,
    nextSlide,
    prevSlide,
    displayStep
  } = useLessonSlides(contentSlides.length);

  const [readerState, setReaderState] = useState<ReaderState>('READING');
  const [peerReflections, setPeerReflections] = useState<any[]>([]);
  const [userReflection, setUserReflection] = useState<string>('');
  const [isLoadingPeers, setIsLoadingPeers] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);

  const { userId, status, incrementLessons, isSignupRequired } = useGuestAuth();
  const supabase = createClient();

  // Load existing reflection if return visit
  useEffect(() => {
    async function loadPreviousReflection() {
      if (!userId) return;
      const { data, error } = await supabase
        .from('reflections')
        .select('response_text')
        .eq('lesson_id', lessonData.id)
        .eq('user_id', userId)
        .maybeSingle();
      
      if (data && !error) {
        setUserReflection(data.response_text);
      }
    }
    loadPreviousReflection();
  }, [lessonData.id, userId, supabase]);

  const fetchPeerInsights = useCallback(async () => {
    setIsLoadingPeers(true);
    try {
      // Fetch some reflections and pick 3 random ones (since Supabase select doesn't support order: random natively without RPC)
      // We neq the current user so they don't see themselves
      const { data, error } = await supabase
        .from('reflections')
        .select('id, response_text, created_at')
        .eq('lesson_id', lessonData.id)
        .neq('user_id', userId || '')
        .limit(20);
      
      if (!error && data) {
        const shuffled = data.sort(() => 0.5 - Math.random()).slice(0, 3);
        setPeerReflections(shuffled);
      }
    } catch (err) {
      console.error('Failed to fetch peer insights:', err);
    } finally {
      setIsLoadingPeers(false);
    }
  }, [lessonData.id, userId, supabase]);

  const handleReflectionSubmit = async (text: string) => {
    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Fallback for purely local guest
        setUserReflection(text);
        setReaderState('REVEALED');
        incrementLessons();
        return;
      }

      const currentUserId = session.user.id;

      // 1. Save the reflection
      const { error: rErr } = await supabase
        .from('reflections')
        .insert({
          user_id: currentUserId,
          lesson_id: lessonData.id,
          response_text: text,
          created_at: new Date().toISOString()
        });

      if (rErr) throw rErr;

      // 2. Mark complete only after reflection save
      setIsMarkingComplete(true);
      const { error: pErr } = await supabase
        .from('user_progress')
        .upsert({
          user_id: currentUserId,
          lesson_id: lessonData.id,
          completed_at: new Date().toISOString()
        }, { onConflict: 'user_id,lesson_id' });

      if (pErr) console.warn('Progress mark failed but reflection saved:', pErr);

      setUserReflection(text);
      setReaderState('REVEALED');
      incrementLessons();
      fetchPeerInsights();

    } catch (err) {
      console.error('Critical reveal failure:', err);
      alert('Your reflection could not be synchronized with the Vault. Please try again.');
    } finally {
      setIsSaving(false);
      setIsMarkingComplete(false);
    }
  };

  const transitionToReflecting = () => {
    if (userReflection) {
      setReaderState('REVEALED');
    } else {
      setReaderState('REFLECTING');
    }
  };

  // If returning to a completed lesson, start in READING but the reflection box will be pre-filled
  // Wait, the prompt says "Check back soon to see how others responded" if none exist.
  // And "peer insights should load immediately without requiring resubmission" on return visit.
  useEffect(() => {
    if (userReflection && readerState === 'REVEALED') {
      fetchPeerInsights();
    }
  }, [userReflection, readerState, fetchPeerInsights]);

  return (
    <div className="w-full min-h-screen relative pb-32 flex flex-col items-center justify-center bg-black overflow-hidden selection:bg-amber-500/20">
      {/* Header */}
      <div className="fixed top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-md pt-6 pb-4 px-8 border-b border-white/5">
        <div className="max-w-xl mx-auto flex items-center justify-between">
           <button 
             onClick={currentSlide === 0 ? () => router.push('/hub') : prevSlide} 
             className="p-2 text-white/20 hover:text-white transition-colors group"
             title={currentSlide === 0 ? "Return to Hub" : "Previous Slide"}
           >
             <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
           </button>
           
           <div className="flex flex-col items-center">
             <div className="flex gap-1 mb-3">
               {Array.from({ length: totalSlides }).map((_, i) => (
                 <div 
                   key={i} 
                   className={`h-[3px] rounded-full transition-all duration-700 ease-out ${i <= currentSlide ? 'w-6 bg-[#52B788]' : 'w-2 bg-white/10'}`} 
                 />
               ))}
             </div>
             <p className="text-[10px] font-bold tracking-[0.2em] text-white/20 uppercase">
               Step {displayStep} of {totalSlides} <span className="text-white/10 mx-2">|</span> {dopamineCues[currentSlide % dopamineCues.length]}
             </p>
           </div>
           
           <div className="flex items-center gap-2">
             {userId && <SaveButton lessonId={lessonData.id} userId={userId} />}
             <button 
               onClick={() => router.push('/hub')} 
               className="p-2 text-white/20 hover:text-rose-500 transition-colors"
               title="Exit Lesson"
             >
               <X className="w-5 h-5" />
             </button>
           </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-xl w-full mx-auto px-6 mt-24 mb-12 flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {readerState === 'READING' && (
            <motion.div 
              className="w-full space-y-8" 
              key={currentSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              onClick={!isHooksSlide && !isFinalSlide ? nextSlide : undefined}
            >
              {!isHooksSlide && !isFinalSlide ? (
                <div className="p-10 bg-[#0d0d10] border border-white/10 shadow-2xl relative overflow-hidden rounded-sm cursor-pointer">
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <h2 className="text-[10px] font-bold tracking-[0.2em] text-white/20 uppercase mb-6">
                    {contentSlides[currentSlide]?.type === 'custom' && contentSlides[currentSlide]?.title 
                      ? contentSlides[currentSlide].title 
                      : (contentSlides[currentSlide]?.type || 'Content')}
                  </h2>
                  <p className="text-white/80 leading-relaxed text-2xl font-sans font-light whitespace-pre-wrap">
                    {contentSlides[currentSlide]?.text || ''}
                  </p>
                </div>
              ) : isHooksSlide ? (
                <div className="space-y-10">
                   <div className="text-center mb-8">
                     <h1 className="text-4xl font-serif text-white mb-4 tracking-tight">{title}</h1>
                     <p className="text-white/20 text-xs tracking-widest uppercase font-medium">{category} • {difficulty}</p>
                   </div>
                   
                   <div className="p-8 border border-white/10 bg-[#0d0d10] shadow-2xl relative overflow-hidden rounded-sm">
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-MINERALS.tigersEye.light to-transparent" />
                     <h3 className="text-[11px] font-bold text-[#D4A017] uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                       <Lightbulb className="w-4 h-4" />
                       Conversational Hooks
                     </h3>
                     <ul className="space-y-6">
                       {lessonData.convo_hooks.map((hook, i) => (
                         <li key={i} className="text-white/50 text-base leading-relaxed pl-6 border-l border-white/10 font-light">
                           {hook}
                         </li>
                       ))}
                     </ul>
                   </div>

                   <div className="pt-4">
                     <button 
                       onClick={nextSlide}
                       className="w-full py-5 bg-white text-black text-xs font-bold tracking-widest uppercase rounded-sm border-b-4 border-zinc-300 active:translate-y-px active:border-b-0 transition-all shadow-xl shadow-white/5"
                     >
                       Drop your take &rarr;
                     </button>
                   </div>
                </div>
              ) : (
                <div className="space-y-12 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center bg-white/[0.02]">
                    <Sparkles className="w-8 h-8 text-[#52B788]" />
                  </div>
                  <div className="text-center max-w-sm">
                    <h2 className="text-3xl font-serif text-white mb-4 tracking-tight">Lesson Concluded.</h2>
                    <p className="text-white/40 font-sans font-light leading-relaxed">
                      Now, calibrate your perspective against the collective intelligence.
                    </p>
                  </div>
                  <button 
                     onClick={transitionToReflecting}
                     className="w-full py-5 bg-white text-black text-xs font-bold tracking-widest uppercase rounded-sm border-b-4 border-zinc-300 active:translate-y-px active:border-b-0 transition-all shadow-xl shadow-white/5"
                   >
                     Continue to Reflection &rarr;
                   </button>
                </div>
              )}
            </motion.div>
          )}

          {readerState === 'REFLECTING' && (
            <motion.div 
              key="reflecting"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <ReflectionBox 
                lessonId={lessonData.id} 
                prompt={lessonData.reflection_prompt} 
                onSuccess={handleReflectionSubmit}
                initialValue={userReflection}
              />
              {isSaving && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex flex-col items-center justify-center">
                  <Loader2 className="w-10 h-10 text-white animate-spin mb-4" />
                  <p className="text-[10px] tracking-[0.3em] uppercase text-white font-bold animate-pulse">
                    {isMarkingComplete ? 'Synchronising Protocol...' : 'Recording Perspective...'}
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {readerState === 'REVEALED' && (
            <motion.div 
              key="revealed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full space-y-16"
            >
              <div className="space-y-4">
                <h3 className="text-center text-[10px] tracking-[0.3em] uppercase text-white/20 font-bold mb-8">Your Perspective</h3>
                <div className="p-8 bg-white/[0.03] border border-white/20 rounded-sm shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#52B788] to-transparent" />
                  <p className="text-white/90 text-lg font-sans font-light leading-relaxed">
                    {userReflection}
                  </p>
                </div>
              </div>

              <div className="space-y-8">
                <div className="text-center">
                  <h3 className="text-3xl font-serif text-white mb-2 tracking-tight">Peer Insights</h3>
                  <p className="text-white/20 text-[10px] tracking-[0.2em] font-bold uppercase">Anonymous Collective Intelligence</p>
                </div>

                {isLoadingPeers ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-6 h-6 text-white/20 animate-spin" />
                  </div>
                ) : peerReflections.length > 0 ? (
                  <div className="space-y-6">
                    {peerReflections.map((r) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={r.id} 
                        className="p-8 bg-[#0d0d10] border border-white/5 rounded-sm shadow-xl"
                      >
                        <p className="text-white/60 text-base leading-relaxed font-sans font-light italic">
                          "{r.response_text}"
                        </p>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 border border-white/5 border-dashed rounded-sm text-center">
                    <p className="text-white/20 text-[10px] tracking-[0.3em] font-bold uppercase">
                      You are one of the first to complete this lesson. Check back soon to see how others responded.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-center pt-8">
                <button 
                   onClick={() => router.push('/hub')}
                   className="px-12 py-5 bg-white text-black text-[10px] font-bold tracking-[0.3em] uppercase rounded-sm transition-all flex items-center gap-4 hover:brightness-95 shadow-2xl shadow-white/5"
                 >
                   <Home className="w-4 h-4" />
                   Return to Hub
                 </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Fixed Continue Button ONLY in READING state for early content slides */}
      {(readerState === 'READING' && !isHooksSlide && !isFinalSlide) && (
        <div className="fixed bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black via-black/90 to-transparent flex justify-center z-40 pointer-events-none">
           <motion.button 
             whileTap={{ scale: 0.98 }}
             onClick={nextSlide}
             className="w-full max-w-sm py-5 bg-white text-black text-xs font-bold tracking-widest uppercase rounded-sm border-b-4 border-zinc-300 active:translate-y-px active:border-b-0 transition-all shadow-xl shadow-white/5 pointer-events-auto"
           >
             Continue &rarr;
           </motion.button>
        </div>
      )}

      {/* Guest Wall */}
      {isSignupRequired && (status === 'anonymous' || status === 'local') && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/98 px-6 animate-in fade-in duration-500">
           {/* ... UI content ... */}
           <div className="w-full max-w-md p-10 bg-[#0d0d10] border border-white/5 rounded-sm shadow-2xl text-center flex flex-col items-center relative">
             <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4A017] to-transparent" />
             <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-8">
                <Sparkles className="w-7 h-7 text-black" />
             </div>
             <h2 className="text-3xl font-serif text-white mb-4 tracking-tight">You've had a taste!</h2>
             <p className="text-white/30 mb-12 leading-relaxed text-[11px] tracking-widest uppercase font-bold font-sans">
               Create a free account to keep going and save everything you have learned.
             </p>
             <div className="w-full space-y-6">
                <a 
                   href="/auth/signup?reason=limit-reached"
                   className="block w-full py-5 bg-white text-black text-[11px] font-bold tracking-[0.25em] uppercase rounded-sm border-b-4 border-zinc-300 active:translate-y-px active:border-b-0 transition-all shadow-xl shadow-white/5"
                >
                   Create account
                </a>
                <button 
                  onClick={() => router.push('/hub')}
                  className="block w-full py-4 text-white/20 hover:text-white transition-all text-[10px] font-bold tracking-[0.3em] uppercase"
                >
                  Back to Hub
                </button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
}

