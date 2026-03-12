'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface OnboardingProps {
  onComplete: (selection: string) => void;
}

const steps = [
  {
    id: 'hook',
    title: "The room is full of people who know things you don't.",
    subtitle: "Not for long.",
    cta: "Show me how",
  },
  {
    id: 'outcomes',
    title: "Insight at the speed of thought.",
    bullets: [
      "Leave every conversation having said something worth remembering.",
      "Master complex cultural concepts in under 3 minutes.",
      "Build a distinct conversational edge that gets noticed."
    ],
    cta: "How does it work?",
  },
  {
    id: 'how-it-works',
    title: "The Learning Loop.",
    content: [
      { step: 1, text: "Consume a 3-minute micro-lesson." },
      { step: 2, text: "Drop your take in the reflection box." },
      { step: 3, text: "Reveal peer insights and expand." }
    ],
    cta: "Start for free",
  },
  {
    id: 'personalization',
    title: "What do you want to get better at?",
    options: [
      "Cultural literacy",
      "Employment rights",
      "Workplace dynamics",
      "Networking",
      "Sector knowledge",
      "Leadership presence"
    ],
    cta: "Take me in",
  }
];

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selection, setSelection] = useState<string>("");
  const [direction, setDirection] = useState(0);

  const handleNext = () => {
    if (currentStep === steps.length - 1) {
      onComplete(selection);
    } else {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    onComplete("");
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    })
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden font-outfit">
      {/* Progress Dots */}
      <div className="absolute top-12 left-0 w-full flex justify-center gap-2 px-8">
        {steps.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 rounded-full bg-white/10 transition-all duration-500",
              i === currentStep ? "w-8 bg-white" : "w-1"
            )}
          />
        ))}
      </div>

      {/* Skip Button */}
      {currentStep < 3 && (
        <button
          onClick={handleSkip}
          className="absolute top-10 right-8 text-[10px] tracking-[0.2em] uppercase text-white/30 hover:text-white transition-colors"
        >
          Skip
        </button>
      )}

      <div className="w-full max-w-md px-8 relative h-[60vh] flex items-center">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentStep}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "tween", ease: "easeInOut", duration: 0.25 },
              opacity: { duration: 0.2 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.x < -100 && currentStep < steps.length - 1) {
                handleNext();
              } else if (info.offset.x > 100 && currentStep > 0) {
                setDirection(-1);
                setCurrentStep((prev) => prev - 1);
              }
            }}
            className="w-full h-full flex flex-col justify-center"
          >
            {currentStep === 0 && (
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl font-serif text-white leading-tight">
                  {steps[0].title}
                </h1>
                <p className="text-white/40 text-xl font-light">
                  {steps[0].subtitle}
                </p>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-10">
                <h1 className="text-3xl font-serif text-white italic">
                  {steps[1].title}
                </h1>
                <ul className="space-y-6">
                  {steps[1].bullets?.map((bullet, i) => (
                    <li key={i} className="flex gap-4 items-start group">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-200/40 mt-2 transition-transform group-hover:scale-125" />
                      <p className="text-white/70 text-lg leading-relaxed font-light">
                        {bullet}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-10">
                <h1 className="text-3xl font-serif text-white">
                  {steps[2].title}
                </h1>
                <div className="space-y-8">
                  {steps[2].content?.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.3 }}
                      className="flex gap-6 items-center p-4 bg-white/[0.02] border border-white/5 rounded-sm"
                    >
                      <span className="text-2xl font-serif text-white/10 group-hover:text-amber-200/20 transition-colors">
                        0{item.step}
                      </span>
                      <p className="text-white/80 text-base font-light tracking-wide">
                        {item.text}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-10">
                <h1 className="text-3xl font-serif text-white">
                  {steps[3].title}
                </h1>
                <div className="flex flex-wrap gap-3">
                  {steps[3].options?.map((option) => (
                    <button
                      key={option}
                      onClick={() => setSelection(option)}
                      className={cn(
                        "px-4 py-2 rounded-full border text-[11px] font-bold tracking-widest uppercase transition-all duration-300",
                        selection === option
                          ? "bg-white text-black border-white"
                          : "bg-transparent text-white/30 border-white/10 hover:border-white/30 hover:text-white"
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* CTA Button */}
      <div className="absolute bottom-20 left-0 w-full px-8">
        <button
          onClick={handleNext}
          disabled={currentStep === 3 && !selection}
          className={cn(
            "w-full max-w-md mx-auto py-5 bg-white text-black text-xs font-black tracking-[0.25em] uppercase rounded-sm border-b-4 border-zinc-300 active:translate-y-px active:border-b-0 transition-all flex items-center justify-center gap-3",
            currentStep === 3 && !selection && "opacity-50 grayscale"
          )}
        >
          {steps[currentStep].cta}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
