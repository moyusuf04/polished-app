'use client';

import { useState, useEffect } from "react";
import { MINERALS, TOKENS } from "@/lib/design-tokens";

interface Lesson {
  id: number;
  title: string;
  mineral: keyof typeof MINERALS;
  status: "complete" | "active" | "locked";
  xp: number;
}

const lessons: Lesson[] = [
  { id: 1, title: "The Art of the Introduction", mineral: "malachite", status: "complete", xp: 120 },
  { id: 2, title: "Silence as a Power Move", mineral: "amethyst", status: "complete", xp: 95 },
  { id: 3, title: "Reading a Room", mineral: "lapis", status: "active", xp: 140 },
  { id: 4, title: "The Anchor Technique", mineral: "tigersEye", status: "locked", xp: 110 },
  { id: 5, title: "Calibrated Questions", mineral: "roseQuartz", status: "locked", xp: 130 },
  { id: 6, title: "The Exit Strategy", mineral: "obsidian", status: "locked", xp: 85 },
];

const css = `
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes rimPulse {
    0%, 100% { box-shadow: 0 0 0 1px rgba(255,255,255,0.06), 0 0 18px 2px rgba(255,255,255,0.04); }
    50%       { box-shadow: 0 0 0 1px rgba(255,255,255,0.12), 0 0 28px 4px rgba(255,255,255,0.08); }
  }
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0);    }
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
  .shimmer-text {
    background: linear-gradient(
      90deg,
      rgba(255,255,255,0.5) 0%,
      rgba(255,255,255,0.9) 40%,
      rgba(255,255,255,0.5) 80%
    );
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 4s linear infinite;
  }
  .lesson-node {
    position: relative; z-index: 2;
    display: flex; align-items: center; gap: 24px;
    padding: 20px 0; cursor: pointer;
    animation: fadeSlideUp 0.5s ease both;
  }
  .node-circle {
    width: 52px; height: 52px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    border: 0.5px solid rgba(255,255,255,0.12);
    transition: all 0.15s ease; position: relative; overflow: hidden;
  }
  .node-circle.active { animation: rimPulse 3s ease-in-out infinite; }
  .node-circle::after {
    content: ''; position: absolute; inset: 0; border-radius: 50%;
    background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%);
  }
  .category-card {
    padding: 28px; border: 0.5px solid rgba(255,255,255,0.07);
    border-radius: 3px; background: rgba(255,255,255,0.02);
    transition: all 0.2s ease; cursor: pointer; position: relative; overflow: hidden;
  }
  .category-card:hover { background: rgba(255,255,255,0.04); transform: translateY(-1px); }
  .xp-bar-fill {
    height: 100%; border-radius: 1px; transition: width 1s ease;
  }
`;

export default function DesignIdentityPage() {
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [xpFill, setXpFill] = useState(0);
  const [activeMineral, setActiveMineral] = useState<keyof typeof MINERALS>("malachite");

  useEffect(() => {
    const t = setTimeout(() => setXpFill(62), 600);
    return () => clearTimeout(t);
  }, []);

  const handleLessonClick = (lesson: Lesson) => {
    if (lesson.status === "locked") return;
    setActiveLesson(lesson);
    setDrawerOpen(true);
  };

  return (
    <div className="polished-root min-h-screen bg-black text-white selection:bg-zinc-800">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="noise-overlay" />

      {/* Hero */}
      <section className="pt-32 pb-16 px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <span className="text-[10px] tracking-[0.2em] uppercase text-white/30 font-medium">Design Identity System · v1.0</span>
          </div>
          <h1 className="font-serif text-6xl md:text-8xl leading-none tracking-tight mb-8">
            <span className="shimmer-text">Polished.</span>
          </h1>
          <p className="font-sans font-light text-xl text-white/40 max-w-lg leading-relaxed">
            A cultural learning platform for ambitious young professionals.<br />
            Editorial luxury, rendered in stone.
          </p>
          <div className="flex gap-4 mt-12 flex-wrap">
            <button className="px-8 py-3.5 bg-white text-black text-xs font-medium tracking-widest uppercase rounded-sm shadow-xl shadow-white/5 border-b-4 border-zinc-300 active:translate-y-px active:border-b-0">
              Begin Learning
            </button>
            <button className="px-8 py-3.5 bg-transparent text-white/60 border border-white/10 text-xs font-medium tracking-widest uppercase rounded-sm hover:border-white/30 hover:text-white transition-all">
              View Skill Tree
            </button>
          </div>
        </div>
      </section>

      <hr className="border-t border-white/5 mx-auto max-w-4xl" />

      {/* Mineral Palette */}
      <section className="py-20 px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <span className="text-[10px] tracking-[0.2em] uppercase text-white/30 font-medium">01 — Mineral Palette</span>
          <h2 className="font-serif text-3xl mt-4 mb-4">Every category, a gemstone.</h2>
          <p className="text-sm text-white/30 font-light max-w-xl mb-12">
            Accent colours are drawn from the mineral world—each with its own luminance, depth, and tactile metaphor.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-12">
            {(Object.entries(MINERALS) as [keyof typeof MINERALS, typeof MINERALS.malachite][]).map(([key, m]) => (
              <div
                key={key}
                className="category-card"
                onClick={() => setActiveMineral(key)}
              >
                <div
                  className="h-20 rounded-sm mb-4 border border-white/5 relative overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${m.dark} 0%, ${m.light} 100%)` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-serif text-sm" style={{ color: m.light }}>{m.label}</span>
                  <span className="text-[9px] text-white/20 tracking-widest">{m.hex}</span>
                </div>
                <p className="text-[10px] text-white/30 tracking-tight uppercase">{m.category}</p>
                {activeMineral === key && (
                  <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${m.light}, transparent)` }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="border-t border-white/5 mx-auto max-w-4xl" />

      {/* Typography */}
      <section className="py-20 px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <span className="text-[10px] tracking-[0.2em] uppercase text-white/30 font-medium">02 — Typography</span>
          <h2 className="font-serif text-3xl mt-4 mb-12">The intellectual premium.</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-white/20 mb-4">Display — Playfair Display</p>
              <p className="font-serif text-5xl leading-tight text-white/90">
                The Art of<br /><em className="italic">First Impressions.</em>
              </p>
            </div>
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-white/20 mb-4">Body — Inter / DM Sans</p>
              <p className="font-sans font-light text-base leading-relaxed text-white/50">
                Master the subtle signals that separate those who simply attend from those who command the room.
                This module distils decades of executive coaching into five precise, deployable techniques.
              </p>
            </div>
          </div>
        </div>
      </section>

      <hr className="border-t border-white/5 mx-auto max-w-4xl" />

      {/* Skill Tree */}
      <section className="py-20 px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <span className="text-[10px] tracking-[0.2em] uppercase text-white/30 font-medium">03 — The Monolithic Skill Tree</span>
          <h2 className="font-serif text-3xl mt-4 mb-4">A gallery of stone plinths.</h2>
          <p className="text-sm text-white/30 mb-12">Tap an active or completed lesson to reveal the preview drawer.</p>

          <div className="relative max-w-md mx-auto">
            {/* Spine */}
            <div className="absolute left-1/2 top-0 bottom-0 w-[0.5px] bg-white/5 -translate-x-1/2" />
            
            {lessons.map((lesson, i) => {
              const m = MINERALS[lesson.mineral];
              const isLeft = i % 2 === 0;
              return (
                <div
                  key={lesson.id}
                  className={`lesson-node ${isLeft ? 'flex-row' : 'flex-row-reverse'} justify-center`}
                  style={{ opacity: lesson.status === "locked" ? 0.35 : 1 }}
                  onClick={() => handleLessonClick(lesson)}
                >
                  <div className={`flex-1 max-w-[180px] ${isLeft ? 'text-right pr-6' : 'text-left pl-6'}`}>
                    <p className={`font-serif text-sm leading-tight transition-colors ${lesson.status === 'active' ? '' : 'text-white/70'}`} style={{ color: lesson.status === 'active' ? m.light : undefined }}>
                      {lesson.title}
                    </p>
                    <p className="text-[10px] text-white/20 tracking-widest mt-1">{lesson.xp} XP</p>
                  </div>

                  <div className={`node-circle ${lesson.status === 'active' ? 'active ring-2 ring-white/10' : ''}`}
                    style={{
                      background: lesson.status === "complete"
                        ? `linear-gradient(135deg, ${m.dark}cc, ${m.light}44)`
                        : lesson.status === "active"
                        ? `linear-gradient(135deg, ${m.dark}, ${m.light}88)`
                        : "rgba(255,255,255,0.04)",
                      borderColor: lesson.status === "active" ? m.light : "rgba(255,255,255,0.1)",
                    }}
                  >
                    {lesson.status === "complete" && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={m.light} strokeWidth="2.5">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    )}
                    {lesson.status === "active" && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: m.light }} />}
                    {lesson.status === "locked" && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0110 0v4" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 max-w-[180px]" />
                </div>
              );
            })}
          </div>

          {/* Local Drawer Component Preview */}
          {drawerOpen && activeLesson && (
            <div className="mt-16 animate-in slide-in-from-bottom duration-300">
               <div className="bg-[#0d0d10] border border-white/10 p-8 rounded-t-lg shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${MINERALS[activeLesson.mineral].light}, transparent)` }} />
                <div className="flex justify-between items-start mb-6">
                   <div>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-white/30 mb-2">
                       {MINERALS[activeLesson.mineral].label} Track · {MINERALS[activeLesson.mineral].category}
                    </p>
                    <h3 className="font-serif text-2xl" style={{ color: MINERALS[activeLesson.mineral].light }}>
                       {activeLesson.title}
                    </h3>
                  </div>
                  <button onClick={() => setDrawerOpen(false)} className="text-white/20 hover:text-white pb-2 text-2xl">&times;</button>
                </div>
                <p className="text-sm font-light text-white/40 leading-relaxed max-w-lg mb-8">
                  Master the calibrated pause—deploying silence not as absence, but as a deliberate signal of considered authority.
                </p>
                <button className="w-full py-4 bg-white text-black text-xs font-bold tracking-widest uppercase rounded-sm border-b-4 border-zinc-300 active:translate-y-px active:border-b-0">
                  Begin Lesson &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
      
      <div className="pb-32" />
    </div>
  );
}
