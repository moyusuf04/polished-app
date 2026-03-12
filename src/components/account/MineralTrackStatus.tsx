'use client';

import { MINERALS, type MineralKey } from '@/lib/design-tokens';
import { TOKENS } from '@/lib/design-tokens';

interface TrackProgress {
  mineral: MineralKey;
  progress: number; // 0 to 100
  title: string;
}

const mockTracks: TrackProgress[] = [
  { mineral: 'malachite', progress: 100, title: 'Presence & Etiquette' },
  { mineral: 'lapis', progress: 65, title: 'Strategic Communication' },
  { mineral: 'amethyst', progress: 20, title: 'Leadership & Influence' },
];

export default function MineralTrackStatus() {
  return (
    <section className="py-16 px-6 relative z-10 border-b" style={{ borderColor: TOKENS.hairline }}>
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="text-[10px] tracking-[0.2em] uppercase text-white/40 font-medium block mb-3">Current Growth</span>
            <h2 className="font-serif text-2xl text-white">Mineral Tracks</h2>
          </div>
          <span className="text-[10px] tracking-[0.2em] uppercase text-white/30">Rank: Obsidian</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockTracks.map((track) => {
            const m = MINERALS[track.mineral];
            const isComplete = track.progress === 100;

            return (
              <div 
                key={track.mineral}
                className="p-6 border rounded-sm relative overflow-hidden group bg-black transition-colors"
                style={{ borderColor: isComplete ? m.light + '40' : TOKENS.hairline }}
              >
                {/* Background glow if complete */}
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
                        className="transition-all duration-1000 ease-out"
                        style={{ color: m.light }}
                        strokeDasharray={`${track.progress}, 100`}
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
