'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

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
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      const supabase = createClient();
      
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setCurrentUser(session.user.id);

      // 5-minute cache guard
      if (Date.now() - lastFetch < CACHE_DURATION_MS && entries.length > 0) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.rpc('get_leaderboard');

      if (!error && data) {
        setEntries(data as LeaderEntry[]);
        setLastFetch(Date.now());
      }
      setIsLoading(false);
    }

    fetchLeaderboard();
  }, [lastFetch, entries.length]);

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-sm p-4 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4 shrink-0">
        <Trophy className="w-3.5 h-3.5 text-amber-300/60" />
        <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/30">
          Leaderboard
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 space-y-1 pr-1 custom-scrollbar">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-6 bg-white/[0.03] rounded-sm animate-pulse" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <p className="text-white/20 text-[11px] font-light">No learners yet.</p>
        ) : (
          entries.map((entry, i) => {
            const isMe = entry.user_id === currentUser;
            return (
              <motion.div
                key={entry.user_id}
                animate={isMe ? {
                  backgroundColor: ['rgba(255,255,255,0.07)', 'rgba(255,255,255,0.12)', 'rgba(255,255,255,0.07)'],
                  outline: ['1px solid rgba(255,255,255,0.1)', '1px solid rgba(255,255,255,0.3)', '1px solid rgba(255,255,255,0.1)']
                } : {}}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className={`flex items-center gap-3 py-2 px-2 rounded-sm transition-colors ${
                  isMe ? 'bg-white/[0.07]' : 'hover:bg-white/[0.02]'
                }`}
              >
                <span className={`text-[10px] font-bold w-4 text-right ${isMe ? 'text-white/80' : 'text-white/15'}`}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col">
                    <p className={`text-[11px] truncate font-medium flex items-center gap-2 ${isMe ? 'text-white font-bold' : 'text-white/60'}`}>
                      {formatPrivacyName(entry.display_name)}
                      {isMe && (
                        <span className="text-[8px] bg-white text-black px-1 rounded-sm tracking-tighter uppercase font-black shadow-lg shadow-white/20">You</span>
                      )}
                    </p>
                    {isMe && (
                      <span className="text-[8px] font-bold tracking-widest text-[#52B788] uppercase mt-0.5">
                        {i === 0 
                          ? 'Peak Protocol' 
                          : `${entries[i-1].total_xp - entry.total_xp + 1} XP To Rank Up`}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: getGradeColor(entry.grade) }}
                  />
                  <span className={`text-[9px] font-bold tracking-[0.15em] uppercase ${isMe ? 'text-white/60' : 'text-white/30'}`}>
                    {entry.grade}
                  </span>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
