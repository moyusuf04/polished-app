'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { LeaderboardCard } from './LeaderboardCard';
import { DailyGoals } from './DailyGoals';
import Link from 'next/link';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isAnonymous: boolean;
  guestId: string | null;
}

export function ActivitySidebar({ isOpen, onClose, isAnonymous, guestId }: Props) {
  const content = (
    <div className="flex flex-col h-full overflow-y-auto p-4 space-y-4">
      {/* Save Progress Widget — anonymous users only */}
      {isAnonymous && (
        <div className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/10 rounded-sm p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4A017] to-transparent" />
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300/60" />
            <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/40">
              Save Progress
            </h3>
          </div>
          <p className="text-[11px] text-white/30 leading-relaxed mb-4 font-light">
            Create a free account to keep your progress, reflections, and rank.
          </p>
          <Link
            href={guestId ? `/signup?origin_guest_id=${guestId}` : '/signup'}
            className="block w-full py-3 bg-white text-black text-[10px] font-bold tracking-[0.2em] uppercase rounded-sm border-b-[3px] border-zinc-300 active:translate-y-px active:border-b-0 transition-all text-center shadow-lg shadow-white/5"
          >
            Create Account
          </Link>
        </div>
      )}

      {/* Daily Goals */}
      <DailyGoals />

      {/* Leaderboard */}
      <LeaderboardCard />
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
