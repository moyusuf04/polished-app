'use client';

import { ArrowLeft, Lightbulb, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LessonClient } from '@/app/lessons/[slug]/LessonClient';
import { useLessonSlides } from '@/hooks/useLessonSlides';

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
  onBack: () => void;
}

const dopamineCues = [
  "Nice start",
  "Interesting point",
  "Almost there",
  "Conversational ammo",
  "Final step"
];

export function InteractiveReader({ title, category, difficulty, lessonData, onBack }: Props) {
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

  return (
    <div className="w-full min-h-screen relative pb-32 flex flex-col items-center justify-center bg-black overflow-hidden">
      {/* Dynamic Header & Progress Area */}
      <div className="fixed top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-md pt-6 pb-4 px-8 border-b border-white/5">
        <div className="max-w-xl mx-auto flex items-center justify-between">
           {/* Back/Prev Button */}
           <button 
             onClick={currentSlide === 0 ? onBack : prevSlide} 
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
           
           {/* Explicit Exit Button */}
           <button 
             onClick={onBack} 
             className="p-2 text-white/20 hover:text-rose-500 transition-colors"
             title="Exit Lesson"
           >
             <X className="w-5 h-5" />
           </button>
        </div>
      </div>

      {/* Main Slide Carousel Area */}
      <div 
        className="max-w-xl w-full mx-auto px-6 mt-24 mb-12 flex-1 flex flex-col justify-center cursor-pointer"
        onClick={nextSlide}
      >
        <AnimatePresence mode="wait">
          <motion.div 
            className="w-full space-y-8" 
            key={currentSlide}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            
            {!isHooksSlide && !isFinalSlide ? (
              <div className="p-10 bg-[#0d0d10] border border-white/10 shadow-2xl relative overflow-hidden">
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
              <div className="space-y-10 cursor-auto" onClick={(e) => e.stopPropagation()}>
                 <div className="text-center mb-8">
                   <h1 className="text-4xl font-serif text-white mb-4 tracking-tight">{title}</h1>
                   <p className="text-white/20 text-xs tracking-widest uppercase">{category} • {difficulty}</p>
                 </div>
                 
                 <div className="p-8 border border-white/10 bg-[#0d0d10] shadow-2xl relative overflow-hidden rounded-sm">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4A017] to-transparent" />
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
              <div className="space-y-8 cursor-auto" onClick={(e) => e.stopPropagation()}>
                 <div className="pt-8 relative z-50">
                   <LessonClient lessonId={lessonData.id} prompt={lessonData.reflection_prompt} onDone={onBack} />
                 </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Fixed Continue Button */}
      {(!isHooksSlide && !isFinalSlide) && (
        <div className="fixed bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black via-black/90 to-transparent flex justify-center z-40 pointer-events-none">
           <motion.button 
             whileTap={{ scale: 0.98 }}
             onClick={nextSlide}
             className="w-full max-w-sm py-4 bg-white text-black text-xs font-bold tracking-widest uppercase rounded-sm border-b-4 border-zinc-300 active:translate-y-px active:border-b-0 transition-all shadow-xl shadow-white/5 pointer-events-auto"
           >
             Continue &rarr;
           </motion.button>
        </div>
      )}
    </div>
  );
}
