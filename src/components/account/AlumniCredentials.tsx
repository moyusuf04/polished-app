'use client';

import { TOKENS, MINERALS } from '@/lib/design-tokens';
import { useState } from 'react';

const mockAlumniFeeds = [
  { id: 1, topic: 'Modern Geopolitics', unlocks: 12, mineral: 'obsidian' },
  { id: 2, topic: 'Stoicism in Boardrooms', unlocks: 8, mineral: 'lapis' },
  { id: 3, topic: 'The Architecture of Capital', unlocks: 15, mineral: 'tigersEye' },
];

export default function AlumniCredentials() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <section className="py-16 px-6 relative z-10 border-b" style={{ borderColor: TOKENS.hairline }}>
      <div className="max-w-5xl mx-auto">
        <div className="mb-12">
          <span className="text-[10px] tracking-[0.2em] uppercase text-white/40 font-medium block mb-3">Asymmetric Influence</span>
          <h2 className="font-serif text-2xl text-white">Alumni Credentials</h2>
          <p className="font-sans font-light text-sm text-white/50 max-w-xl mt-3">
            Audiences earned through the mastery of specific intellectual territories.
            Visible proof of utility, absent the noise of symmetric connections.
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          {mockAlumniFeeds.map((feed) => {
            const m = MINERALS[feed.mineral as keyof typeof MINERALS];
            const isHovered = hoveredId === feed.id;

            return (
              <div 
                key={feed.id}
                onMouseEnter={() => setHoveredId(feed.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="px-6 py-4 border rounded-sm flex items-center gap-4 cursor-pointer transition-all duration-300"
                style={{ 
                  borderColor: isHovered ? m.light : TOKENS.hairline,
                  backgroundColor: isHovered ? m.light + '0A' : 'transparent'
                }}
              >
                <div 
                  className="w-1.5 h-12 rounded-full transition-colors duration-300" 
                  style={{ backgroundColor: isHovered ? m.light : TOKENS.subtle }} 
                />
                
                <div>
                  <p className="font-serif text-lg text-white/90 group-hover:text-white transition-colors">{feed.topic}</p>
                  <p className="text-[10px] tracking-[0.2em] uppercase mt-1 transition-colors" style={{ color: isHovered ? m.light : 'rgba(255,255,255,0.4)' }}>
                    {feed.unlocks} Members Following
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
