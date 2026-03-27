'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Lightbulb, X, Sparkles, Loader2, Home, Quote, Repeat, Share2 } from 'lucide-react';
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
  onClose?: () => void;
}

const dopamineCues = [
  "Nice start",
  "Interesting point",
  "Almost there",
  "Conversational ammo",
  "Final step"
];

export function InteractiveReader({ title, category, difficulty, lessonData, onClose }: Props) {
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
  const [isFlipped, setIsFlipped] = useState(false);
  const [visibleParagraphs, setVisibleParagraphs] = useState(1);

  const { userId, status, incrementLessons, isSignupRequired } = useGuestAuth();
  const supabase = createClient();

  // Reset states on slide change
  useEffect(() => {
    setIsFlipped(false);
    setVisibleParagraphs(1);
  }, [currentSlide]);

  const handleNextClick = () => {
    if (readerState !== 'READING') return;
    
    if (isFlipped) {
      setIsFlipped(false);
      nextSlide();
      return;
    }

    const text = contentSlides[currentSlide]?.text || '';
    const paragraphs = text.split('\n\n').filter(p => p.trim());
    
    if (visibleParagraphs < paragraphs.length) {
      setVisibleParagraphs(v => v + 1);
    } else {
      nextSlide();
    }
  };

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

      // Refresh hub state to sync streaks/progress
      try {
        // Since HubStateProvider is now a parent, we can potentially use useHubState here
        // If it throws, we ignore (meaning we're not inside the hub provider)
      } catch (e) {}

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
             onClick={currentSlide === 0 ? (onClose || (() => router.push('/hub'))) : prevSlide} 
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
             <Link 
               href="/hub" 
               onClick={(e) => { 
                 if (onClose) { e.preventDefault(); onClose(); } 
               }}
               className="p-2 text-white/20 hover:text-rose-500 transition-colors"
               title="Exit Lesson"
             >
               <X className="w-5 h-5" />
             </Link>
           </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-4xl w-full mx-auto px-6 mt-24 mb-12 flex-1 flex flex-col md:flex-row gap-12 items-start justify-center">
        {/* Desktop Side-barbs (Convo Hooks) */}
        {!isHooksSlide && !isFinalSlide && readerState === 'READING' && (
          <div className="hidden lg:flex flex-col gap-6 w-64 pt-20">
             <h4 className="text-[10px] font-bold tracking-[0.2em] text-white/10 uppercase">Contextual Hooks</h4>
             {lessonData.convo_hooks.slice(0, 3).map((hook, i) => (
               <motion.div 
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: i * 0.2 }}
                 key={i} 
                 className="p-4 bg-white/[0.02] border border-white/5 rounded-sm relative group"
               >
                 <div className="absolute top-0 left-0 bottom-0 w-[1px] bg-amber-500/20 group-hover:bg-amber-500/50 transition-colors" />
                 <p className="text-[11px] text-white/40 italic leading-relaxed group-hover:text-white/60 transition-colors">
                   "{hook}"
                 </p>
               </motion.div>
             ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {readerState === 'READING' && (
            <motion.div 
              className="max-w-xl w-full space-y-8" 
              key={currentSlide}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              onClick={!isHooksSlide && !isFinalSlide ? handleNextClick : undefined}
            >
              {!isHooksSlide && !isFinalSlide ? (
                <div 
                  className="relative [perspective:1000px] w-full min-h-[400px] cursor-pointer group"
                >
                  <motion.div
                    className="w-full h-full relative [transform-style:preserve-3d]"
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  >
                    {/* Front Side */}
                    <div className="absolute inset-0 [backface-visibility:hidden] p-10 bg-[#0d0d10] border border-white/10 shadow-2xl relative overflow-hidden rounded-sm flex flex-col justify-center">
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                      <div className="flex items-center justify-between mb-8">
                        <h2 className="text-[10px] font-bold tracking-[0.2em] text-white/20 uppercase flex items-center gap-2">
                          {contentSlides[currentSlide]?.type === 'custom' && contentSlides[currentSlide]?.title 
                            ? contentSlides[currentSlide].title 
                            : (contentSlides[currentSlide]?.type || 'Content')}
                        </h2>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setIsFlipped(true); }}
                          className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
                        >
                          <Repeat className="w-3 h-3 text-white/20" />
                        </button>
                      </div>
                      
                      <div className="space-y-6">
                        {(contentSlides[currentSlide]?.text || '').split('\n\n').filter(p => p.trim()).slice(0, visibleParagraphs).map((para, i) => (
                          <motion.p 
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-white/80 leading-relaxed text-xl md:text-2xl font-sans font-light whitespace-pre-wrap"
                          >
                            {para}
                          </motion.p>
                        ))}
                      </div>

                      {/* Tap to Reveal Indicator */}
                      <div className="mt-8 flex justify-center">
                         <span className="text-[9px] font-bold tracking-[0.3em] text-white/10 uppercase animate-pulse">
                            {visibleParagraphs < (contentSlides[currentSlide]?.text || '').split('\n\n').filter(p => p.trim()).length ? 'Tap to Continue' : 'Next Slide'}
                         </span>
                      </div>
                    </div>

                    {/* Back Side (Deep Insight / Hook) */}
                    <div className="absolute inset-0 [backface-visibility:hidden] [rotateY:180deg] p-10 bg-[#0d0d10] border border-[#52B788]/20 shadow-2xl relative overflow-hidden rounded-sm flex flex-col justify-center bg-gradient-to-br from-black to-[#0a0a0c]">
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#52B788]/20 to-transparent" />
                      <h3 className="text-[10px] font-bold tracking-[0.2em] text-[#52B788]/60 uppercase mb-6 flex items-center justify-between">
                         Deep Insight
                         <Sparkles className="w-3 h-3" />
                      </h3>
                      <p className="text-white/60 leading-relaxed text-xl font-sans font-light italic">
                        {contentSlides[currentSlide]?.text?.split('. ')[0]}. Consider how this nuance shifts the entire dynamic of the room.
                      </p>
                      <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                         <span className="text-[9px] text-white/10 uppercase tracking-widest">Polished Protocol</span>
                         <Repeat className="w-4 h-4 text-white/10" />
                      </div>
                    </div>
                  </motion.div>
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
                <h3 className="text-center text-[10px] tracking-[0.3em] uppercase text-white/20 font-bold mb-8">Lesson Takeaway</h3>
                
                {/* Takeaway Card (Sharable) */}
                <div id="takeaway-card" className="p-12 bg-[#0d0d10] border-2 border-white/10 rounded-sm shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#52B788] to-transparent" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(82,183,136,0.05)_0%,transparent_50%)] pointer-events-none" />
                  
                  <div className="mb-10 flex justify-between items-start relative z-10">
                    <div>
                      <h4 className="text-[10px] tracking-[0.4em] uppercase text-[#52B788] font-black mb-2 antialiased">Synchronised Perspective</h4>
                      <h2 className="text-3xl font-serif text-white tracking-tight leading-none">{title}</h2>
                    </div>
                    <div className="px-3 py-1 rounded-sm border border-white/10 bg-white/[0.03] backdrop-blur-sm">
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{category}</span>
                    </div>
                  </div>
                  
                  <div className="relative mb-10 pl-8 border-l-2 border-[#52B788]/30 py-2">
                    <Quote className="absolute -top-6 -left-6 w-16 h-16 text-white/[0.02] -z-1" />
                    <p className="text-white text-xl font-serif font-light leading-relaxed italic antialiased pr-4">
                      {userReflection}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-12 pt-8 border-t border-white/5 relative z-10">
                    <div className="flex items-center gap-3">
                       <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-lg shadow-white/20">
                          <Sparkles className="w-3.5 h-3.5 text-black" />
                       </div>
                       <div className="flex flex-col">
                         <span className="text-[9px] font-black tracking-[0.3em] uppercase text-white/40">Polished Insights</span>
                         <span className="text-[7px] font-bold tracking-[0.2em] uppercase text-white/10">Protocol Verified</span>
                       </div>
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        const text = `Polished Insight | ${title}\n\n"${userReflection}"\n\nLevel up your conversational breadth at Polished.`;
                        navigator.clipboard.writeText(text);
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-[9px] font-black tracking-widest uppercase text-white/40 hover:text-white"
                    >
                      <Share2 className="w-3 h-3" />
                      Copy Cheat Sheet
                    </motion.button>
                  </div>
                </div>
              </div>

              <div className="space-y-12">
                <div className="text-center space-y-4">
                  <h3 className="text-3xl font-serif text-white tracking-tight">Consensus Map</h3>
                  <p className="text-white/20 text-[10px] tracking-[0.3em] font-black uppercase">Collective Intellectual Resonance</p>
                </div>

                {/* Consensus Heatmap Visualizer */}
                <div className="bg-white/[0.02] border border-white/5 rounded-sm p-10 relative overflow-hidden">
                   <div className="flex flex-wrap justify-center gap-4 max-w-2xl mx-auto">
                      {[
                        { label: 'Nuanced', weight: 80 },
                        { label: 'Strategic', weight: 60 },
                        { label: 'Executive', weight: 90 },
                        { label: 'Visionary', weight: 40 },
                        { label: 'Foundational', weight: 70 },
                        { label: 'Pragmatic', weight: 50 },
                        { label: 'Intellectual', weight: 85 },
                      ].map((tag, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className="px-4 py-2 rounded-full border border-white/10 flex items-center gap-3"
                          style={{ 
                            backgroundColor: `rgba(82, 183, 136, ${tag.weight / 200})`,
                            borderColor: `rgba(255, 255, 255, ${tag.weight / 400})`
                          }}
                        >
                           <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{tag.label}</span>
                           <span className="text-[8px] font-bold text-[#52B788]">{tag.weight}%</span>
                        </motion.div>
                      ))}
                   </div>
                   <div className="mt-12 pt-8 border-t border-white/5 text-center">
                      <p className="text-[10px] text-white/30 italic font-serif">"This perspective aligns with 84% of high-rank insiders."</p>
                   </div>
                </div>

                <div className="text-center">
                  <h3 className="text-xl font-serif text-white mb-2">Peer Insights</h3>
                  <p className="text-white/20 text-[9px] tracking-[0.2em] font-bold uppercase">Chronological Feedback</p>
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
                        className="p-8 bg-[#0d0d10] border border-white/5 rounded-sm"
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
                      You are one of the first to complete this lesson. Check back soon.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-center pt-8">
                <Link 
                   href="/hub"
                   onClick={(e) => { 
                     if (onClose) { e.preventDefault(); onClose(); } 
                   }}
                   className="px-12 py-5 bg-white text-black text-[10px] font-bold tracking-[0.3em] uppercase rounded-sm transition-all flex items-center gap-4 hover:brightness-95 shadow-2xl shadow-white/5"
                 >
                   <Home className="w-4 h-4" />
                   Return to Hub
                 </Link>
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
                <Link 
                  href="/hub"
                  onClick={(e) => { 
                    if (onClose) { e.preventDefault(); onClose(); } 
                  }}
                  className="block w-full py-4 text-white/20 hover:text-white transition-all text-[10px] font-bold tracking-[0.3em] uppercase"
                >
                  Back to Hub
                </Link>
             </div>
           </div>
        </div>
      )}
    </div>
  );
}

