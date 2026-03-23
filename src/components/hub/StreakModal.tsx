'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Flame, Calendar, CheckCircle2, Circle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentStreak: number;
  userId: string | null;
}

export function StreakModal({ isOpen, onClose, currentStreak, userId }: Props) {
  const [history, setHistory] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchHistory() {
      if (!userId) {
        setIsLoading(false);
        return;
      }
      const { data, error } = await supabase.rpc('get_streak_history', { 
        p_user_id: userId,
        p_days: 7 
      });
      if (data && !error) {
        setHistory((data as any[]).map(d => d.active_date));
      }
      setIsLoading(false);
    }
    fetchHistory();
  }, [userId, supabase]);

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-sm bg-[#0d0d10] border border-white/10 rounded-sm shadow-2xl p-8 overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#F59E0B] to-transparent" />
            
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-white/20 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/20">
                <Flame className="w-8 h-8 text-[#F59E0B]" />
              </div>

              <div>
                <h2 className="text-3xl font-serif text-white mb-2 tracking-tight">
                  {currentStreak} Day Streak
                </h2>
                <p className="text-white/40 text-[10px] tracking-[0.2em] font-bold uppercase">
                  Consistency is the currency of growth.
                </p>
              </div>

              <div className="w-full grid grid-cols-7 gap-2 pt-4">
                {last7Days.map((dateStr) => {
                  const isActive = history.includes(dateStr);
                  const dayName = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'narrow' });
                  const isToday = dateStr === new Date().toISOString().split('T')[0];

                  return (
                    <div key={dateStr} className="flex flex-col items-center gap-2">
                       <span className={`text-[9px] font-bold uppercase ${isToday ? 'text-amber-500' : 'text-white/20'}`}>
                         {dayName}
                       </span>
                       <div className={`w-10 h-10 rounded-sm flex items-center justify-center border transition-all ${
                         isActive 
                           ? 'bg-amber-500/20 border-amber-500/30 text-amber-500' 
                           : 'bg-white/[0.02] border-white/5 text-white/10'
                       }`}>
                         {isActive ? (
                           <CheckCircle2 className="w-5 h-5" />
                         ) : (
                           <Circle className="w-4 h-4" />
                         )}
                       </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={onClose}
                className="w-full py-4 mt-4 bg-white text-black text-[10px] font-bold tracking-[0.3em] uppercase rounded-sm hover:brightness-95 transition-all shadow-xl shadow-white/5"
              >
                Keep it up
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
