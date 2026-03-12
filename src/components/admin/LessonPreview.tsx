'use client';

import type { SlideData } from '@/lib/validators/lesson';

interface Props {
  title: string;
  slides: SlideData[];
  reflectionPrompt: string;
  convoHooks: string[];
  duration?: string;
  format?: string;
  xpReward?: number;
}

import { Lightbulb, Smartphone } from 'lucide-react';

export function LessonPreview({ title, slides, reflectionPrompt, convoHooks, duration, format, xpReward }: Props) {
  return (
    <div className="bg-black border border-white/5 shadow-2xl relative overflow-hidden max-w-sm mx-auto rounded-sm group">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      {/* Simulated Phone Header */}
      <div className="bg-[#0d0d10] px-6 py-4 border-b border-white/5 text-center flex items-center justify-center gap-2">
        <Smartphone className="w-3 h-3 text-white/20" />
        <p className="text-[10px] text-white/20 font-bold uppercase tracking-[0.22em]">Device Mockup</p>
      </div>

      <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden bg-black/40">
        {/* Title */}
        <div className="text-center py-6 border-b border-white/5 mb-2">
          <p className="text-[9px] text-white/20 tracking-[0.2em] uppercase mb-2 font-bold font-sans">Institutional Header</p>
          <h2 className="text-2xl font-serif text-white tracking-tight">{title || 'Untitled Lesson'}</h2>
        </div>

        {/* Slides */}
        <div className="space-y-4">
          {slides.map((slide, i) => (
            <div key={i} className="bg-[#0d0d10] border border-white/5 p-5 relative overflow-hidden rounded-sm">
               <div className="absolute top-0 left-0 bottom-0 w-[2px] bg-[#52B788]/20" />
              <p className="text-[9px] text-white/20 uppercase tracking-[0.15em] font-bold mb-3">
                {slide.type === 'custom' && slide.title ? slide.title : slide.type}
              </p>
              <p className="text-white/70 text-sm leading-relaxed font-sans font-light whitespace-pre-wrap">{slide.text || '(Instructional content missing)'}</p>
            </div>
          ))}
        </div>

        {slides.length === 0 && (
          <div className="py-12 text-center border border-white/5 border-dashed rounded-sm">
             <p className="text-white/10 text-[10px] tracking-[0.2em] font-bold uppercase">Awaiting content slides...</p>
          </div>
        )}

        {/* Hooks */}
        {convoHooks.length > 0 && (
          <div className="border border-white/10 bg-[#0d0d10] p-6 relative overflow-hidden rounded-sm">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4A017] to-transparent" />
            <h3 className="text-[10px] font-bold text-[#D4A017] uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
              <Lightbulb className="w-3 h-3" />
              Conversational Hooks
            </h3>
            <ul className="space-y-4">
              {convoHooks.map((hook, i) => (
                <li key={i} className="text-white/50 text-xs leading-relaxed pl-4 border-l border-white/5 font-light">{hook || '(Incomplete hook)'}</li>
              ))}
            </ul>
          </div>
        )}

         {/* Attributes */}
         <div className="grid grid-cols-3 gap-2 py-4 border-y border-white/5">
            {[
              { label: "Duration", value: duration || "4 min" },
              { label: "Format", value: format || "Bite-size" },
              { label: "Reward", value: xpReward ? `${xpReward} XP` : "120 XP" }
            ].map(stat => (
              <div key={stat.label}>
                <p className="text-[7px] text-white/20 tracking-widest uppercase mb-1">{stat.label}</p>
                <p className="text-[9px] font-medium text-white/50">{stat.value}</p>
              </div>
            ))}
         </div>

         {/* Reflection */}
        {reflectionPrompt && (
          <div className="bg-[#0d0d10] border border-white/10 p-6 relative overflow-hidden rounded-sm">
             <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <p className="text-[10px] text-white/20 uppercase tracking-[0.15em] font-bold mb-4">Critical Reflection</p>
            <p className="text-white/80 text-base font-serif mb-6 leading-snug">{reflectionPrompt}</p>
            <div className="bg-white/[0.03] border border-white/10 p-4 text-white/10 text-xs font-sans tracking-wide">
              I think that...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
