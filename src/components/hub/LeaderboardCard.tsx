'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Trophy } from 'lucide-react';

interface LeaderEntry {
  user_id: string;
  display_name: string | null;
  total_xp: number;
  grade: string;
}

const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Privacy-safe display name: first name + last initial.
 * e.g. "John Smith" → "John S."
 * Falls back to "Learner" if no name set.
 */
function formatPrivacyName(name: string | null): string {
  if (!name || !name.trim()) return 'Learner';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

function getGradeColor(grade: string): string {
  const map: Record<string, string> = {
    Quartz: '#C4B5A0',
    Emerald: '#52B788',
    Diamond: '#B9D6F2',
  };
  return map[grade] ?? '#C4B5A0';
}

export function LeaderboardCard() {
  const [entries, setEntries] = useState<LeaderEntry[]>([]);
  const [lastFetch, setLastFetch] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      // 5-minute cache guard
      if (Date.now() - lastFetch < CACHE_DURATION_MS && entries.length > 0) {
        setIsLoading(false);
        return;
      }

      const supabase = createClient();
      const { data, error } = await supabase.rpc('get_leaderboard');

      if (!error && data) {
        setEntries(data as LeaderEntry[]);
        setLastFetch(Date.now());
      }
      setIsLoading(false);
    }

    fetchLeaderboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-sm p-4">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-3.5 h-3.5 text-amber-300/60" />
        <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/30">
          Leaderboard
        </h3>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-6 bg-white/[0.03] rounded-sm animate-pulse" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <p className="text-white/20 text-[11px] font-light">No learners yet.</p>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, i) => (
            <div
              key={entry.user_id}
              className="flex items-center gap-3 py-1.5"
            >
              <span className="text-[10px] font-bold text-white/15 w-4 text-right">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-white/60 truncate font-medium">
                  {formatPrivacyName(entry.display_name)}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: getGradeColor(entry.grade) }}
                />
                <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-white/30">
                  {entry.grade}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
