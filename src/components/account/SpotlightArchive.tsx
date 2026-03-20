'use client';

import { TOKENS, MINERALS } from '@/lib/design-tokens';
import Link from 'next/link';
import { categoryToMineral } from './MineralTrackStatus';
import { toggleSpotlight } from '@/actions/account-actions';
import { useState, useOptimistic, useTransition } from 'react';
import { Star } from 'lucide-react';

interface ReflectionEntry {
  id: string;
  created_at: string;
  response_text: string;
  lesson_id: string;
  lesson_title: string;
  category_name: string;
  category_color: string;
  is_spotlighted: boolean;
}

interface SpotlightArchiveProps {
  reflections: ReflectionEntry[];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export type { ReflectionEntry };

export default function SpotlightArchive({ reflections }: SpotlightArchiveProps) {
  const [isPending, startTransition] = useTransition();

  // Optimistic state for spotlight toggles
  const [optimisticReflections, updateOptimistic] = useOptimistic<
    ReflectionEntry[],
    { id: string; is_spotlighted: boolean }
  >(reflections, (state, action) =>
    state.map((r) =>
      r.id === action.id ? { ...r, is_spotlighted: action.is_spotlighted } : r
    )
  );

  // Track individual error per reflection
  const [errorId, setErrorId] = useState<string | null>(null);

  const handleToggle = async (reflectionId: string, currentState: boolean) => {
    const newState = !currentState;
    setErrorId(null);

    startTransition(() => {
      updateOptimistic({ id: reflectionId, is_spotlighted: newState });
    });

    const result = await toggleSpotlight(reflectionId, newState);
    if (!result.success) {
      // Rollback happens automatically when the transition resolves
      // because optimistic state resets to the actual reflections prop
      setErrorId(reflectionId);
    }
  };

  if (reflections.length === 0) {
    return (
      <section className="py-16 px-6 relative z-10 border-b" style={{ borderColor: TOKENS.hairline }}>
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <span className="text-[10px] tracking-[0.2em] uppercase text-white/40 font-medium block mb-3">Curation History</span>
            <h2 className="font-serif text-2xl text-white">The Spotlight Archive</h2>
          </div>
          <p className="text-white/30 text-sm font-light">
            Your reflections will appear here once you complete a lesson and submit your take.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-6 relative z-10 border-b" style={{ borderColor: TOKENS.hairline }}>
      <div className="max-w-5xl mx-auto">
        <div className="mb-12">
          <span className="text-[10px] tracking-[0.2em] uppercase text-white/40 font-medium block mb-3">Curation History</span>
          <h2 className="font-serif text-2xl text-white">The Spotlight Archive</h2>
          <p className="font-sans font-light text-sm text-white/50 max-w-xl mt-3">
            A permanent ledger of your insights — {reflections.length} perspective{reflections.length !== 1 ? 's' : ''} logged.
            Spotlight your best to feature them in Intel Drop cards.
          </p>
        </div>

        <div className="space-y-4">
          {optimisticReflections.map((take) => {
            const mineral = categoryToMineral(take.category_name);
            const m = MINERALS[mineral];
            const hasError = errorId === take.id;

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
                    <span className="text-[10px] tracking-widest text-white/30">{formatDate(take.created_at)}</span>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span className="text-xs font-serif text-white/70">{take.lesson_title}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Spotlight Toggle */}
                    <button
                      onClick={() => handleToggle(take.id, take.is_spotlighted)}
                      disabled={isPending}
                      className="flex items-center gap-1.5 text-[10px] tracking-[0.15em] uppercase transition-colors disabled:opacity-50"
                      style={{ color: take.is_spotlighted ? '#D4A017' : 'rgba(255,255,255,0.3)' }}
                      aria-label={take.is_spotlighted ? 'Remove from spotlight' : 'Add to spotlight'}
                    >
                      <Star
                        className="w-3.5 h-3.5 transition-all"
                        fill={take.is_spotlighted ? '#D4A017' : 'transparent'}
                        strokeWidth={1.5}
                      />
                      {take.is_spotlighted ? 'Spotlighted' : 'Spotlight'}
                    </button>

                    <Link
                      href={`/lessons/${take.lesson_id}`}
                      className="text-[10px] tracking-[0.2em] uppercase hover:text-white transition-colors flex items-center gap-2"
                      style={{ color: m.light }}
                    >
                      View Context Focus
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>

                <p className="font-serif text-xl md:text-2xl text-white/90 leading-snug max-w-3xl">
                  {take.response_text}
                </p>

                {hasError && (
                  <p className="text-[10px] text-red-400 mt-2">Failed to update spotlight. Try again.</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
