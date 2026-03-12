'use client';

import { TOKENS, MINERALS, type MineralKey } from '@/lib/design-tokens';
import { useState } from 'react';

const TYPE_STYLES = [
  { id: 'classic', label: 'Classic Serif', family: 'var(--font-serif)' },
  { id: 'modern', label: 'Editorial Sans', family: 'var(--font-sans)' },
  { id: 'mono', label: 'Typewriter Mono', family: 'var(--font-mono)' },
];

export default function IntelDropCustomiser() {
  const [activeMineral, setActiveMineral] = useState<MineralKey>('malachite');
  const [activeType, setActiveType] = useState(TYPE_STYLES[0]);
  
  const m = MINERALS[activeMineral];

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Customiser Controls */}
          <div className="space-y-12">
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
                        opacity: isActive ? 1 : 0.5 
                      }}
                    >
                      <div className="absolute inset-0 group-hover:opacity-100 transition-opacity" style={{ background: `linear-gradient(135deg, ${currentM.dark}, ${currentM.light})`, opacity: isActive ? 0.2 : 0 }} />
                      <span className="relative z-10 text-[10px] tracking-widest text-white uppercase">{currentM.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

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
                        backgroundColor: isActive ? 'rgba(255,255,255,0.03)' : 'transparent'
                      }}
                    >
                      <span style={{ fontFamily: type.family }} className="text-lg text-white/90">{type.label}</span>
                      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Preview Card */}
          <div className="relative aspect-[4/5] md:aspect-square w-full max-w-md mx-auto flex items-center justify-center p-8 lg:p-12 overflow-hidden bg-[#050505]">
             {/* The Card */}
             <div 
               className="w-full relative bg-[#0a0a0a] border flex flex-col justify-between shadow-2xl transition-all duration-500"
               style={{ 
                 aspectRatio: '3/4',
                 borderColor: m.light + '40'
               }}
             >
               {/* Top Gradient Border */}
               <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${m.dark}, ${m.light})` }} />
               
               <div className="p-8 md:p-10 flex-1 flex flex-col justify-center">
                 <p className="text-white/30 text-xs tracking-widest uppercase mb-6 flex items-center gap-2">
                   <span className="w-1 h-1 bg-white/30 rounded-full"/>
                   Vaulted Insight
                 </p>
                 <p 
                   className="text-white text-2xl md:text-3xl leading-snug pr-4" 
                   style={{ fontFamily: activeType.family }}
                 >
                   "The most powerful position in the room is rarely the one doing the most speaking. It is the one shaping the silence."
                 </p>
               </div>

               <div className="px-8 pb-8 md:px-10 md:pb-10 pt-4 border-t border-white/5 flex justify-between items-end">
                 <div>
                   <p className="text-white/80 text-sm font-medium">A. Professional</p>
                   <p className="text-white/40 text-[10px] tracking-widest uppercase mt-1">Polished App</p>
                 </div>
                 {/* Decorative element based on mineral */}
                 <div className="w-6 h-6 rounded-full opacity-50" style={{ background: `linear-gradient(135deg, ${m.dark}, ${m.light})` }} />
               </div>
             </div>
             
             {/* Background noise specifically for the preview area */}
             <div className="absolute inset-0 pointer-events-none opacity-20 filter contrast-[200%] grayscale" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />
          </div>

        </div>
      </div>
    </section>
  );
}
