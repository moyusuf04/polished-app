'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, MessageSquare, Quote } from 'lucide-react';
import { LeaderboardCard } from './LeaderboardCard';
import { DailyGoals } from './DailyGoals';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isAnonymous: boolean;
  guestId: string | null;
  completedLessonsCount: number;
}

function ReflectionPulse() {
  const [pulse, setPulse] = useState<{ text: string; id: string } | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchPulse() {
      const { data } = await supabase
        .from('reflections')
        .select('id, response_text')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (data && data.length > 0) {
        const random = data[Math.floor(Math.random() * data.length)];
        setPulse({ text: random.response_text, id: random.id });
      }
    }

    fetchPulse();
    const interval = setInterval(fetchPulse, 10000); // Rotate every 10s
    return () => clearInterval(interval);
  }, [supabase]);

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-sm p-4 relative overflow-hidden group min-h-[100px] flex flex-col justify-center">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="w-3 h-3 text-cyan-400/60" />
        <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/30">
          Reflection Pulse
        </h3>
      </div>
      
      <AnimatePresence mode="wait">
        {pulse ? (
          <motion.div
            key={pulse.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="relative"
          >
            <Quote className="absolute -top-2 -left-2 w-4 h-4 text-white/5" />
            <p className="text-[11px] text-white/50 italic leading-relaxed font-light pl-3">
              "{pulse.text.length > 80 ? pulse.text.substring(0, 77) + '...' : pulse.text}"
            </p>
          </motion.div>
        ) : (
          <div className="h-10 flex items-center">
            <div className="w-full h-2 bg-white/5 rounded animate-pulse" />
          </div>
        )}
      </AnimatePresence>

      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent" />
    </div>
  );
}

export function ActivitySidebar({ isOpen, onClose, isAnonymous, guestId, completedLessonsCount }: Props) {
  const content = (
    <div className="flex flex-col h-full overflow-y-auto p-4 space-y-4">
      {/* Save Progress Widget — anonymous users only */}
      {isAnonymous && (
        <div className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/10 rounded-sm p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4A017] to-transparent" />
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300/60" />
              <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/40">
                Save Progress
              </h3>
            </div>
            {completedLessonsCount > 0 && (
              <div className="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20">
                <span className="text-[8px] font-black text-red-400 uppercase tracking-tighter">
                  {completedLessonsCount} at Risk
                </span>
              </div>
            )}
          </div>
          <p className="text-[11px] text-white/30 leading-relaxed mb-4 font-light">
            Create a free account to keep your reflections, milestones, and rank.
          </p>
          <Link
            href={guestId ? `/signup?origin_guest_id=${guestId}` : '/signup'}
            className="block w-full py-3 bg-white text-black text-[10px] font-bold tracking-[0.2em] uppercase rounded-sm border-b-[3px] border-zinc-300 active:translate-y-px active:border-b-0 transition-all text-center shadow-lg shadow-white/5"
          >
            Create Account
          </Link>
        </div>
      )}

      {/* Live Insight Ticker */}
      <div className="bg-white/[0.02] border border-white/5 rounded-sm p-3 overflow-hidden relative">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse transition-all duration-1000" />
          <span className="text-[8px] font-bold tracking-[0.2em] text-white/20 uppercase">Live Protocol Feed</span>
        </div>
        <div className="h-6 relative overflow-hidden">
          <motion.div 
            animate={{ y: [0, -32, -64, -96, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="space-y-4"
          >
            {[
              "Someone reached Quartz Tier in Culture",
              "New insight shared in Film History",
              "Discovery track unlocked: Etiquette",
              "3 learners just completed 'The Gaze'"
            ].map((text, i) => (
              <p key={i} className="text-[10px] text-white/40 italic whitespace-nowrap overflow-hidden text-ellipsis h-4">
                {text}
              </p>
            ))}
          </motion.div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-[#0a0a0c] to-transparent pointer-events-none" />
      </div>

      {/* Daily Goals */}
      <DailyGoals />

      {/* Reflection Pulse Ticker */}
      <ReflectionPulse />

      {/* Leaderboard */}
      <div className="flex-1 min-h-[300px]">
        <LeaderboardCard />
      </div>
    </div>
  );

  return (
    <>

      {/* Desktop: persistent sidebar (animated) */}
      <motion.aside 
        initial={false}
        animate={{ 
          width: isOpen ? 240 : 0,
          opacity: isOpen ? 1 : 0,
          borderLeftWidth: isOpen ? 1 : 0
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="hidden md:flex flex-col bg-[#0a0a0c]/80 border-white/5 backdrop-blur-xl h-full overflow-hidden shrink-0 overflow-x-hidden"
      >
        <div className="w-60 h-full flex flex-col">
          {content}
        </div>
      </motion.aside>

      {/* Mobile: slide-in drawer overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              drag="x"
              dragConstraints={{ left: 0, right: 280 }}
              dragElastic={0.1}
              onDragEnd={(_, info) => {
                if (info.offset.x > 100) onClose();
              }}
              className="fixed top-0 right-0 bottom-0 w-72 bg-[#0a0a0c]/95 border-l border-white/10 backdrop-blur-2xl z-50 md:hidden shadow-2xl"
            >
              {/* Close handle */}
              <div className="absolute top-4 left-4">
                <button
                  onClick={onClose}
                  className="p-2 text-white/30 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {/* Drag handle indicator */}
              <div className="absolute top-1/2 left-2 -translate-y-1/2 w-1 h-8 bg-white/10 rounded-full" />
              <div className="pt-14">
                {content}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
