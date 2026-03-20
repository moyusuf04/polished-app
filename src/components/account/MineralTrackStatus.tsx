'use client';

import { MINERALS, TOKENS, type MineralKey } from '@/lib/design-tokens';
import { useEffect, useState } from 'react';

interface TrackProgress {
  mineral: MineralKey;
  progress: number; // 0 to 100
  title: string;
  completed: number;
  total: number;
}

interface MineralTrackStatusProps {
  categoryProgress: TrackProgress[];
  rank: string;
  totalXp: number;
}

// Map category names to mineral keys
function categoryToMineral(categoryName: string): MineralKey {
  const lower = categoryName.toLowerCase();
  if (lower.includes('etiquette') || lower.includes('presence')) return 'malachite';
  if (lower.includes('communication') || lower.includes('strategic')) return 'lapis';
  if (lower.includes('leadership') || lower.includes('influence')) return 'amethyst';
  if (lower.includes('financial') || lower.includes('capital') || lower.includes('acumen')) return 'tigersEye';
  if (lower.includes('executive')) return 'obsidian';
  if (lower.includes('emotional') || lower.includes('intelligence')) return 'roseQuartz';
  // Cycle through minerals for unmapped categories
  const keys = Object.keys(MINERALS) as MineralKey[];
  const hash = categoryName.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return keys[hash % keys.length];
}

export { categoryToMineral };

export default function MineralTrackStatus({ categoryProgress, rank, totalXp }: MineralTrackStatusProps) {
  // Animate progress values from 0 on mount
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (categoryProgress.length === 0) {
    return (
      <section className="py-16 px-6 relative z-10 border-b" style={{ borderColor: TOKENS.hairline }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="text-[10px] tracking-[0.2em] uppercase text-white/40 font-medium block mb-3">Current Growth</span>
              <h2 className="font-serif text-2xl text-white">Mineral Tracks</h2>
            </div>
            <span className="text-[10px] tracking-[0.2em] uppercase text-white/30">
              Rank: {rank} <span className="text-white/10 mx-1">•</span> {totalXp} XP
            </span>
          </div>
          <p className="text-white/30 text-sm font-light">Complete your first lesson to begin tracking progress.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-6 relative z-10 border-b" style={{ borderColor: TOKENS.hairline }}>
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="text-[10px] tracking-[0.2em] uppercase text-white/40 font-medium block mb-3">Current Growth</span>
            <h2 className="font-serif text-2xl text-white">Mineral Tracks</h2>
          </div>
          <span className="text-[10px] tracking-[0.2em] uppercase text-white/30">
            Rank: {rank} <span className="text-white/10 mx-1">•</span> {totalXp} XP
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categoryProgress.map((track) => {
            const m = MINERALS[track.mineral];
            const isComplete = track.progress === 100;
            const displayProgress = animated ? track.progress : 0;

            return (
              <div
                key={track.title}
                className="p-6 border rounded-sm relative overflow-hidden group bg-black transition-colors"
                style={{ borderColor: isComplete ? m.light + '40' : TOKENS.hairline }}
              >
                {isComplete && (
                  <div
                    className="absolute inset-0 opacity-[0.03] transition-opacity group-hover:opacity-[0.06]"
                    style={{ background: `linear-gradient(135deg, ${m.dark}, ${m.light})` }}
                  />
                )}

                <div className="flex items-start justify-between mb-8 relative z-10">
                  <div>
                    <p className="text-[10px] tracking-[0.2em] uppercase mb-1" style={{ color: m.light }}>{m.label}</p>
                    <h3 className="font-serif text-lg text-white/90">{track.title}</h3>
                    <p className="text-[10px] text-white/30 mt-2">
                      {track.completed} / {track.total} lessons
                    </p>
                  </div>

                  {/* Circular Progress Ring */}
                  <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-white/10"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        className="transition-all duration-[800ms] ease-out"
                        style={{ color: m.light }}
                        strokeDasharray={`${displayProgress}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                    {isComplete ? (
                      <svg className="absolute w-4 h-4" viewBox="0 0 24 24" fill="none" stroke={m.light} strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="absolute text-[10px] font-medium text-white/70">{track.progress}%</span>
                    )}
                  </div>
                </div>

                {isComplete && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${m.light}, transparent)` }} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
