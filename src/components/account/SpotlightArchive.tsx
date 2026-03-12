'use client';

import { TOKENS, MINERALS } from '@/lib/design-tokens';

const mockTakes = [
  { 
    id: 1, 
    date: '24 Oct 2026', 
    lesson: 'The Strategic Pause', 
    excerpt: 'Silence is not the absence of thought, it is the canvas upon which authority is projected.',
    mineral: 'amethyst'
  },
  { 
    id: 2, 
    date: '12 Sep 2026', 
    lesson: 'Reading the Room (Advanced)', 
    excerpt: 'Observe who speaks first, but watch who everyone looks at after the first speaker finishes.',
    mineral: 'malachite'
  },
  { 
    id: 3, 
    date: '03 Aug 2026', 
    lesson: 'The Anchor Technique', 
    excerpt: 'The first number spoken sets the psychological gravity of the entire negotiation.',
    mineral: 'tigersEye'
  }
];

export default function SpotlightArchive() {
  return (
    <section className="py-16 px-6 relative z-10 border-b" style={{ borderColor: TOKENS.hairline }}>
      <div className="max-w-5xl mx-auto">
        <div className="mb-12">
          <span className="text-[10px] tracking-[0.2em] uppercase text-white/40 font-medium block mb-3">Curation History</span>
          <h2 className="font-serif text-2xl text-white">The Spotlight Archive</h2>
          <p className="font-sans font-light text-sm text-white/50 max-w-xl mt-3">
            A permanent ledger of your insights that were elevated by curation and vaulted by the collective.
          </p>
        </div>

        <div className="space-y-4">
          {mockTakes.map((take) => {
            const m = MINERALS[take.mineral as keyof typeof MINERALS];

            return (
              <div 
                key={take.id} 
                className="group border rounded-sm p-6 hover:bg-white/[0.02] transition-colors relative overflow-hidden"
                style={{ borderColor: TOKENS.hairline }}
              >
                {/* Left Accent line */}
                <div className="absolute left-0 top-0 bottom-0 w-[2px] opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: m.light }} />
                
                <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] tracking-widest text-white/30">{take.date}</span>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span className="text-xs font-serif text-white/70">{take.lesson}</span>
                  </div>
                  
                  <button className="text-[10px] tracking-[0.2em] uppercase hover:text-white transition-colors flex items-center gap-2" style={{ color: m.light }}>
                    View Context Focus
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>
                
                <p className="font-serif text-xl md:text-2xl text-white/90 leading-snug max-w-3xl">
                  {take.excerpt}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
