'use client';

import { TOKENS, MINERALS, type MineralKey } from '@/lib/design-tokens';
import { useState } from 'react';
import type { ReflectionEntry } from './SpotlightArchive';
import { categoryToMineral } from './MineralTrackStatus';
import Link from 'next/link';

const TYPE_STYLES = [
  { id: 'classic', label: 'Classic Serif', className: 'font-serif' },
  { id: 'modern', label: 'Editorial Sans', className: 'font-sans' },
  { id: 'mono', label: 'Typewriter Mono', className: 'font-mono' },
] as const;

interface IntelDropCustomiserProps {
  reflections: ReflectionEntry[];
  displayName: string;
}

export default function IntelDropCustomiser({ reflections, displayName }: IntelDropCustomiserProps) {
  const [activeMineral, setActiveMineral] = useState<MineralKey>('malachite');
  const [activeType, setActiveType] = useState<(typeof TYPE_STYLES)[number]>(TYPE_STYLES[0]);
  const [selectedReflectionId, setSelectedReflectionId] = useState<string | null>(
    reflections.length > 0 ? reflections[0].id : null
  );

  const selectedReflection = reflections.find(r => r.id === selectedReflectionId);

  // If a reflection is selected, try to derive the mineral from its category
  const derivedMineral = selectedReflection
    ? categoryToMineral(selectedReflection.category_name)
    : activeMineral;
  const m = MINERALS[derivedMineral];

  const previewText = selectedReflection?.response_text
    || '\u201CThe most powerful position in the room is rarely the one doing the most speaking. It is the one shaping the silence.\u201D';

  // No spotlighted reflections — show empty state
  const showEmptyState = reflections.length === 0;

  return (
    <section className="py-16 px-6 relative z-10">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12">
          <span className="text-[10px] tracking-[0.2em] uppercase text-white/40 font-medium block mb-3">Prestige Exports</span>
          <h2 className="font-serif text-2xl text-white">Intel Drop Cards</h2>
          <p className="font-sans font-light text-sm text-white/50 max-w-xl mt-3">
            Customise the visual grammar of your exported insights. Turn your vaulted reflections into high-prestige assets.
          </p>
        </div>

        {showEmptyState ? (
          <div className="border rounded-sm p-12 text-center" style={{ borderColor: TOKENS.hairline }}>
            <p className="text-white/40 text-sm font-light mb-4">
              You have not spotlighted any reflections yet. Complete lessons and mark your best insights to see them here.
            </p>
            <Link
              href="/hub"
              className="inline-flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-white/50 hover:text-white transition-colors"
            >
              Go to Skill Tree Hub
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

            {/* Customiser Controls */}
            <div className="space-y-12">
              {/* Reflection Selector */}
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-white/40 mb-4">Select Vaulted Insight</p>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin">
                  {reflections.map((r) => {
                    const isActive = selectedReflectionId === r.id;
                    return (
                      <button
                        key={r.id}
                        onClick={() => setSelectedReflectionId(r.id)}
                        className="w-full text-left px-4 py-3 border rounded-sm transition-all"
                        style={{
                          borderColor: isActive ? TOKENS.muted : TOKENS.hairline,
                          backgroundColor: isActive ? 'rgba(255,255,255,0.03)' : 'transparent',
                        }}
                      >
                        <p className="text-xs text-white/70 truncate">{r.response_text}</p>
                        <p className="text-[10px] text-white/30 mt-1">{r.lesson_title}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mineral Border Selector (when no reflection selected) */}
              {!selectedReflection && (
                <div>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-white/40 mb-4">Select Mineral Border</p>
                  <div className="grid grid-cols-3 gap-3">
                    {(Object.keys(MINERALS) as MineralKey[]).map((key) => {
                      const currentM = MINERALS[key];
                      const isActive = activeMineral === key;
                      return (
                        <button
                          key={key}
                          onClick={() => setActiveMineral(key)}
                          className="h-12 border rounded-sm relative overflow-hidden transition-all group"
                          style={{
                            borderColor: isActive ? currentM.light : TOKENS.hairline,
                            opacity: isActive ? 1 : 0.5,
                          }}
                        >
                          <div
                            className="absolute inset-0 group-hover:opacity-100 transition-opacity"
                            style={{
                              background: `linear-gradient(135deg, ${currentM.dark}, ${currentM.light})`,
                              opacity: isActive ? 0.2 : 0,
                            }}
                          />
                          <span className="relative z-10 text-[10px] tracking-widest text-white uppercase">{currentM.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Typography Selector */}
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-white/40 mb-4">Select Typography</p>
                <div className="flex flex-col gap-3">
                  {TYPE_STYLES.map((type) => {
                    const isActive = activeType.id === type.id;
                    return (
                      <button
                        key={type.id}
                        onClick={() => setActiveType(type)}
                        className="px-6 py-4 border rounded-sm text-left transition-all flex justify-between items-center group"
                        style={{
                          borderColor: isActive ? TOKENS.muted : TOKENS.hairline,
                          backgroundColor: isActive ? 'rgba(255,255,255,0.03)' : 'transparent',
                        }}
                      >
                        <span className={`${type.className} text-lg text-white/90`}>{type.label}</span>
                        {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Export — Coming Soon */}
              <div className="pt-4 border-t" style={{ borderColor: TOKENS.hairline }}>
                <button
                  disabled
                  className="w-full py-3 border rounded-sm text-[10px] tracking-[0.2em] uppercase text-white/20 cursor-not-allowed transition-colors"
                  style={{ borderColor: TOKENS.hairline }}
                >
                  Export Card — Coming Soon
                </button>
              </div>
            </div>

            {/* Preview Card */}
            <div className="relative aspect-[4/5] md:aspect-square w-full max-w-md mx-auto flex items-center justify-center p-8 lg:p-12 overflow-hidden bg-[#050505]">
              <div
                className="w-full relative bg-[#0d0d10] border flex flex-col justify-between shadow-2xl transition-all duration-500"
                style={{
                  aspectRatio: '3/4',
                  borderColor: selectedReflection?.category_color
                    ? `${selectedReflection.category_color}60`
                    : `${m.light}40`,
                }}
              >
                {/* Top Gradient Border */}
                <div
                  className="h-1 w-full"
                  style={{
                    background: selectedReflection?.category_color
                      ? `linear-gradient(90deg, ${selectedReflection.category_color}cc, ${selectedReflection.category_color})`
                      : `linear-gradient(90deg, ${m.dark}, ${m.light})`
                  }}
                />

                <div className="p-8 md:p-10 flex-1 flex flex-col justify-center overflow-hidden">
                  <p className="text-white/30 text-xs tracking-widest uppercase mb-6 flex items-center gap-2">
                    <span className="w-1 h-1 bg-white/30 rounded-full" />
                    Vaulted Insight
                  </p>
                  <p
                    className={`text-white text-2xl md:text-3xl leading-snug pr-4 ${activeType.className} ${activeType.id === 'mono' ? 'overflow-hidden text-ellipsis' : ''}`}
                    style={activeType.id === 'mono' ? { display: '-webkit-box', WebkitLineClamp: 6, WebkitBoxOrient: 'vertical' as const } : undefined}
                  >
                    {previewText}
                  </p>
                </div>

                <div className="px-8 pb-8 md:px-10 md:pb-10 pt-4 border-t border-white/5 flex justify-between items-end">
                  <div>
                    <p className="text-white/80 text-sm font-medium">{displayName || 'Anonymous'}</p>
                    <p className="text-white/40 text-[10px] tracking-widest uppercase mt-1">Polished App</p>
                  </div>
                  <div className="w-6 h-6 rounded-full opacity-50" style={{ background: `linear-gradient(135deg, ${m.dark}, ${m.light})` }} />
                </div>
              </div>

              {/* Background noise */}
              <div
                className="absolute inset-0 pointer-events-none opacity-20 filter contrast-[200%] grayscale"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
              />
            </div>

          </div>
        )}
      </div>
    </section>
  );
}
