'use client';

import { useState, useEffect, useRef } from "react";
import { MINERALS, TOKENS } from "@/lib/design-tokens";

// ── GLOBAL STYLES FOR THE LIBRARY ────────────────────────────────────────
const libraryStyles = `
  @keyframes sheenPass {
    0%   { transform: translateX(-120%) skewX(-20deg); }
    100% { transform: translateX(320%)  skewX(-20deg); }
  }
  @keyframes rimPulse {
    0%,100%{box-shadow:0 0 0 1px rgba(255,255,255,0.06),0 0 18px 2px rgba(255,255,255,0.04)} 
    50%{box-shadow:0 0 0 1px rgba(255,255,255,0.14),0 0 28px 5px rgba(255,255,255,0.09)} 
  }
  @keyframes spin { to{transform:rotate(360deg)} }

  .btn-polished {
    position: relative;
    overflow: hidden;
    transition: transform 0.08s ease, box-shadow 0.1s ease, filter 0.1s ease;
    user-select: none;
    isolation: isolate;
  }
  .btn-polished::after {
    content: ''; position: absolute; top: 0; left: 0; width: 40%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
    transform: translateX(-120%) skewX(-20deg);
    pointer-events: none;
  }
  .btn-polished:hover::after { animation: sheenPass 0.55s ease forwards; }
  .btn-polished:active:not(:disabled) { transform: scale(0.97) translateY(1.5px); filter: brightness(0.88); }
  
  .metallic-platinum {
    background: linear-gradient(160deg, #f0f0f0 0%, #d8d8d8 30%, #eaeaea 50%, #c8c8c8 70%, #e0e0e0 100%);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.45);
  }
  .metallic-steel {
    background: linear-gradient(160deg, #2a2a30 0%, #1a1a20 35%, #252530 55%, #141418 100%);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.5), 0 0 0 0.5px rgba(255,255,255,0.1);
  }
`;

function XPRing({ pct = 62, mineral = "malachite", size = 88 }: { pct?: number, mineral?: keyof typeof MINERALS, size?: number }) {
  const m = MINERALS[mineral as keyof typeof MINERALS] || MINERALS.malachite;
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const [offset, setOffset] = useState(circ);
  useEffect(() => { const t = setTimeout(() => setOffset(circ * (1 - pct / 100)), 400); return () => clearTimeout(t); }, [circ, pct]);
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={m.light} strokeWidth="2" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="absolute text-center">
        <p className="font-serif text-white/90" style={{ fontSize: size > 72 ? 20 : 14 }}>{pct}%</p>
        <p className="text-[8px] text-white/20 tracking-[0.12em] uppercase">XP</p>
      </div>
    </div>
  );
}

export default function ComponentLibraryPage() {
  const [activeSection, setActiveSection] = useState("Buttons");
  const [modalOpen, setModalOpen] = useState(false);
  const [toasts, setToasts] = useState<{ id: number, msg: string, color: string, icon: string }[]>([]);
  const [activeTab, setActiveTab] = useState(0);

  const addToast = (type: 'success' | 'info' | 'warning' | 'error') => {
    const configs = {
      success: { msg: "Lesson complete. +120 XP earned.", color: MINERALS.malachite.light, icon: "✓" },
      info: { msg: "New module unlocked: Tiger's Eye.", color: MINERALS.lapis.light, icon: "◆" },
      warning: { msg: "Streak at risk. Resume by midnight.", color: MINERALS.tigersEye.light, icon: "!" },
      error: { msg: "Sync failed. Check your connection.", color: MINERALS.roseQuartz.light, icon: "×" },
    };
    const c = configs[type];
    const id = Date.now();
    setToasts(t => [...t, { id, ...c }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  };

  const menu = [
    { group: "Foundation", items: ["Buttons", "Inputs", "Badges", "Avatars"] },
    { group: "Feedback", items: ["Toasts", "Modal", "Loaders"] },
    { group: "Data", items: ["Cards", "Progress", "Stats"] },
    { group: "Navigation", items: ["Tabs"] },
  ];

  return (
    <div className="min-h-screen bg-black text-white/70 font-sans selection:bg-zinc-800">
      <style dangerouslySetInnerHTML={{ __html: libraryStyles }} />
      
      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 fixed inset-y-0 border-r border-white/5 bg-black p-10 hidden md:flex flex-col gap-8">
          <div>
            <p className="font-serif text-lg text-white/80">Polished.</p>
            <p className="text-[9px] tracking-[0.15em] text-white/20 uppercase mt-1">Component Library</p>
          </div>
          {menu.map(group => (
            <div key={group.group}>
              <p className="text-[8px] tracking-[0.2em] text-white/10 uppercase mb-3">{group.group}</p>
              <div className="flex flex-col gap-1">
                {group.items.map(item => (
                  <button 
                    key={item} 
                    onClick={() => setActiveSection(item)}
                    className={`text-left px-3 py-1.5 rounded-sm text-xs transition-colors ${activeSection === item ? 'bg-white/5 text-white' : 'text-white/30 hover:text-white/50'}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Content */}
        <main className="flex-1 md:ml-64 p-12 max-w-5xl">
          <header className="mb-20">
            <span className="text-[10px] tracking-[0.2em] uppercase text-white/20">Polished · Design System</span>
            <h1 className="font-serif text-5xl text-white/90 mt-4">Component Library</h1>
            <p className="mt-6 font-light text-white/40 leading-relaxed max-w-xl">
              Every UI primitive in the Polished design language. Obsidian surfaces, mineral accents, mechanical interactions.
            </p>
          </header>

          {/* Section: Buttons */}
          <section className="mb-24">
            <div className="mb-10">
              <span className="text-[10px] tracking-[0.15em] text-white/30 uppercase">01 — Buttons</span>
              <p className="text-sm text-white/20 mt-2 font-light">Metallic surfaces with CNC-milled throw.</p>
            </div>
            
            <div className="flex flex-col gap-12">
              <div className="flex flex-wrap gap-4 items-end">
                 <button className="btn-polished metallic-platinum px-8 py-3 text-[11px] font-bold tracking-widest uppercase text-black rounded-sm">Primary</button>
                 <button className="btn-polished metallic-steel px-8 py-3 text-[11px] font-bold tracking-widest uppercase text-white/70 rounded-sm">Ghost</button>
                 <button className="btn-polished px-8 py-3 text-[11px] font-bold tracking-widest uppercase text-white/40 border border-white/10 rounded-sm">Outline</button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {Object.entries(MINERALS).map(([key, m]) => (
                  <button 
                    key={key} 
                    className="btn-polished px-4 py-2.5 text-[9px] font-bold tracking-widest uppercase text-center rounded-sm"
                    style={{ 
                      background: `linear-gradient(155deg, ${m.dark} 0%, ${m.hex} 40%, ${m.light} 100%)`,
                      color: 'white',
                      boxShadow: `inset 0 1px 0 rgba(255,255,255,0.2), 0 4px 12px ${m.dark}44`
                    }}
                  >
                    {m.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Section: Badges */}
          <section className="mb-24">
            <div className="mb-10">
              <span className="text-[10px] tracking-[0.15em] text-white/30 uppercase">02 — Badges</span>
            </div>
            <div className="flex flex-wrap gap-4">
              {Object.entries(MINERALS).map(([key, m]) => (
                <span key={key} className="inline-flex items-center gap-2 px-3 py-1 rounded-sm border border-white/5 text-[9px] tracking-widest uppercase" style={{ backgroundColor: `${m.dark}11`, color: m.light }}>
                  <span className="w-1 h-1 rounded-full" style={{ backgroundColor: m.light }} />
                  {key}
                </span>
              ))}
            </div>
          </section>

          {/* Section: Progress */}
          <section className="mb-24">
             <div className="mb-10">
              <span className="text-[10px] tracking-[0.15em] text-white/30 uppercase">03 — Progress</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-2xl">
              <div className="flex flex-col gap-6">
                <div>
                   <div className="flex justify-between mb-2 text-[10px] tracking-widest">
                     <span className="text-white/20 uppercase">Module Progress</span>
                     <span className="text-malachite-light" style={{ color: MINERALS.malachite.light }}>62%</span>
                   </div>
                   <div className="h-0.5 bg-white/5 w-full rounded-full overflow-hidden">
                     <div className="h-full transition-all duration-1000 ease-out" style={{ width: '62%', background: `linear-gradient(90deg, ${MINERALS.malachite.dark}, ${MINERALS.malachite.light})` }} />
                   </div>
                </div>
                <div>
                   <div className="flex justify-between mb-2 text-[10px] tracking-widest">
                     <span className="text-white/20 uppercase">Streak Protection</span>
                     <span style={{ color: MINERALS.tigersEye.light }}>85%</span>
                   </div>
                   <div className="h-0.5 bg-white/5 w-full rounded-full overflow-hidden">
                     <div className="h-full transition-all duration-1000 ease-out" style={{ width: '85%', background: `linear-gradient(90deg, ${MINERALS.tigersEye.dark}, ${MINERALS.tigersEye.light})` }} />
                   </div>
                </div>
              </div>
              <div className="flex gap-8 justify-center items-center">
                 <XPRing pct={74} mineral="amethyst" size={80} />
                 <XPRing pct={42} mineral="lapis" size={80} />
              </div>
            </div>
          </section>

          {/* Section: Feedback */}
          <section className="mb-24">
             <div className="mb-10">
              <span className="text-[10px] tracking-[0.15em] text-white/30 uppercase">04 — Feedback</span>
            </div>
            <div className="flex flex-wrap gap-4">
               <button onClick={() => addToast('success')} className="px-6 py-2 border border-white/10 text-[10px] uppercase tracking-widest hover:border-white/30 transition-colors">Fire Toast</button>
               <button onClick={() => setModalOpen(true)} className="px-6 py-2 border border-white/10 text-[10px] uppercase tracking-widest hover:border-white/30 transition-colors">Open Modal</button>
               <div className="flex items-center gap-4 ml-4">
                  <div className="w-4 h-4 rounded-full border border-white/10 border-t-white/80 animate-spin" />
                  <span className="text-[10px] tracking-widest uppercase text-white/20">Loading...</span>
               </div>
            </div>
          </section>

        </main>
      </div>

      {/* Toast Stack */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-3 z-[100]">
        {toasts.map(t => (
          <div key={t.id} className="bg-[#111114] border border-white/10 p-4 min-w-[300px] flex items-start gap-4 shadow-2xl animate-in slide-in-from-right duration-300" style={{ borderLeft: `2px solid ${t.color}` }}>
            <span style={{ color: t.color }}>{t.icon}</span>
            <p className="text-xs text-white/70">{t.msg}</p>
          </div>
        ))}
      </div>

      {/* Modal Overlay */}
      {modalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setModalOpen(false)}>
           <div className="bg-[#0d0d10] border border-white/10 p-10 rounded-sm max-w-md w-full shadow-2xl relative overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${MINERALS.amethyst.light}, transparent)` }} />
              <span className="text-[10px] tracking-[0.15em] text-white/30 uppercase block mb-4">Module Unlocked</span>
              <h2 className="font-serif text-3xl text-white/90 mb-4">Strategic Communication</h2>
              <p className="text-sm font-light text-white/40 leading-relaxed mb-10">
                You've unlocked the Lapis Lazuli track. Six lessons covering high-stakes negotiation, reading rooms, and calibrated questions.
              </p>
              <div className="grid grid-cols-2 gap-4">
                 <button className="btn-polished metallic-platinum py-3 text-[10px] font-bold uppercase tracking-widest text-black" onClick={() => setModalOpen(false)}>Begin</button>
                 <button className="py-3 text-[10px] font-bold uppercase tracking-widest text-white/40 border border-white/10" onClick={() => setModalOpen(false)}>Dismiss</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
