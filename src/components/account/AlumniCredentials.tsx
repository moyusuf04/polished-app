'use client';

import { TOKENS, MINERALS, type MineralKey } from '@/lib/design-tokens';
import { categoryToMineral } from './MineralTrackStatus';

interface AlumniEntry {
  id: string;
  category_name: string;
  lesson_title: string;
  completed_at: string;
}

interface AlumniCredentialsProps {
  entries: AlumniEntry[];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export type { AlumniEntry };

export default function AlumniCredentials({ entries }: AlumniCredentialsProps) {
  if (entries.length === 0) {
    return (
      <section className="py-16 px-6 relative z-10 border-b" style={{ borderColor: TOKENS.hairline }}>
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <span className="text-[10px] tracking-[0.2em] uppercase text-white/40 font-medium block mb-3">Achievement Ledger</span>
            <h2 className="font-serif text-2xl text-white">Completed Lessons</h2>
          </div>
          <p className="text-white/30 text-sm font-light">
            Complete your first lesson to see your achievements here.
          </p>
        </div>
      </section>
    );
  }

  // Group entries by category
  const grouped = new Map<string, AlumniEntry[]>();
  entries.forEach((entry) => {
    const existing = grouped.get(entry.category_name) ?? [];
    existing.push(entry);
    grouped.set(entry.category_name, existing);
  });

  return (
    <section className="py-16 px-6 relative z-10 border-b" style={{ borderColor: TOKENS.hairline }}>
      <div className="max-w-5xl mx-auto">
        <div className="mb-12">
          <span className="text-[10px] tracking-[0.2em] uppercase text-white/40 font-medium block mb-3">Achievement Ledger</span>
          <h2 className="font-serif text-2xl text-white">Completed Lessons</h2>
          <p className="font-sans font-light text-sm text-white/50 max-w-xl mt-3">
            {entries.length} lesson{entries.length !== 1 ? 's' : ''} completed across {grouped.size} categor{grouped.size !== 1 ? 'ies' : 'y'}.
          </p>
        </div>

        <div className="space-y-8">
          {Array.from(grouped.entries()).map(([categoryName, lessons]) => {
            const mineral = categoryToMineral(categoryName);
            const m = MINERALS[mineral];

            return (
              <div key={categoryName}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: m.light }} />
                  <h3 className="text-[10px] tracking-[0.2em] uppercase font-medium" style={{ color: m.light }}>
                    {categoryName}
                  </h3>
                  <span className="text-[10px] text-white/20">{lessons.length} lesson{lessons.length !== 1 ? 's' : ''}</span>
                </div>

                <div className="space-y-2 pl-5">
                  {lessons.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-baseline justify-between py-3 border-b"
                      style={{ borderColor: TOKENS.hairline }}
                    >
                      <p className="font-serif text-sm text-white/80">{entry.lesson_title}</p>
                      <span className="text-[10px] tracking-widest text-white/30 shrink-0 ml-4">
                        {formatDate(entry.completed_at)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
