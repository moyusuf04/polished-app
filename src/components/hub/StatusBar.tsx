'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Menu, PanelRightOpen, Calendar } from 'lucide-react';
import { FocusReserve } from './FocusReserve';
import { MINERAL_GRADES } from '@/lib/design-tokens';
import { useState, useEffect } from 'react';
import { StreakModal } from './StreakModal';

interface Props {
  energyUnits: number;
  currentStreak: number;
  mineralGrade: string;
  lastEnergyReset: Date;
  onToggleLeft: () => void;
  onToggleRight: () => void;
  lastLessonAt: Date | null;
  userId: string | null;
}

function getGradeColor(grade: string): string {
  const match = Object.values(MINERAL_GRADES).find(g => g.label === grade);
  return match?.color ?? '#C4B5A0';
}

export function StatusBar({
  energyUnits,
  currentStreak,
  mineralGrade,
  lastEnergyReset,
  onToggleLeft,
  onToggleRight,
  lastLessonAt,
  userId,
}: Props) {
  const [showStreakModal, setShowStreakModal] = useState(false);
  
  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getUTCFullYear() === d2.getUTCFullYear() &&
           d1.getUTCMonth() === d2.getUTCMonth() &&
           d1.getUTCDate() === d2.getUTCDate();
  };

  const hasActivityToday = lastLessonAt && isSameDay(new Date(lastLessonAt), new Date());
  const gradeColor = getGradeColor(mineralGrade);
  
  const [prevGrade, setPrevGrade] = useState(mineralGrade);
  const [showEvolution, setShowEvolution] = useState(false);

  useEffect(() => {
    if (mineralGrade !== prevGrade) {
      setShowEvolution(true);
      const timer = setTimeout(() => setShowEvolution(false), 3000);
      setPrevGrade(mineralGrade);
      return () => clearTimeout(timer);
    }
  }, [mineralGrade, prevGrade]);

  const [prevEnergy, setPrevEnergy] = useState(energyUnits);
  useEffect(() => {
    if (energyUnits !== prevEnergy) {
      setPrevEnergy(energyUnits);
    }
  }, [energyUnits, prevEnergy]);

  const energyIncreased = energyUnits > prevEnergy;
  const isLowEnergy = energyUnits === 1;

  return (
    <header className="w-full h-12 bg-[#0a0a0c]/90 border-b border-white/5 backdrop-blur-xl flex items-center justify-between px-4 z-40 sticky top-0 overflow-hidden">
      {/* Full-screen Evolution Shimmer */}
      <AnimatePresence>
        {showEvolution && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] pointer-events-none overflow-hidden"
          >
            <motion.div 
               animate={{ 
                 background: [
                   `linear-gradient(135deg, ${gradeColor}00 0%, ${gradeColor}33 50%, ${gradeColor}00 100%)`,
                   `linear-gradient(135deg, ${gradeColor}33 0%, ${gradeColor}00 50%, ${gradeColor}33 100%)`,
                   `linear-gradient(135deg, ${gradeColor}00 0%, ${gradeColor}33 50%, ${gradeColor}00 100%)`
                 ],
                 x: ['-100%', '100%']
               }}
               transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
               className="absolute inset-0 bg-white/10 blur-3xl opacity-30 mix-blend-overlay rotate-12"
            />
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
            <div className="absolute inset-0 flex items-center justify-center">
               <motion.div 
                 initial={{ scale: 0.5, opacity: 0 }}
                 animate={{ scale: [0.5, 1.2, 1], opacity: 1 }}
                 className="flex flex-col items-center"
               >
                 <span className="text-[10px] font-bold tracking-[1em] uppercase text-white/40 mb-4">Rank Evolved</span>
                 <h2 className="text-5xl font-serif text-white tracking-widest uppercase">{mineralGrade}</h2>
               </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mineral Pulse Background */}
      <AnimatePresence mode="popLayout">
        <motion.div 
          key={mineralGrade}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0, 0.15, 0], scale: [0.8, 1.2, 1.5] }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute inset-0 -z-10"
          style={{ backgroundColor: gradeColor }}
        />
      </AnimatePresence>

      {/* Left: Hamburger + Streak */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleLeft}
          className="p-2 text-white/30 hover:text-white transition-colors active:scale-90"
          aria-label="Toggle navigation"
        >
          <Menu className="w-4 h-4" />
        </button>

        <button 
          onClick={() => setShowStreakModal(true)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.03] border border-white/5 hover:bg-white/10 transition-all group" 
          title={`${currentStreak} day streak`}
        >
          <div className="relative">
            {currentStreak > 0 && (
              <motion.div 
                className="absolute inset-0 blur-md rounded-full -z-10"
                animate={{ 
                  backgroundColor: hasActivityToday ? '#F59E0B' : 'rgba(245, 158, 11, 0.2)',
                  scale: [1, 1.5, 1],
                  opacity: [0.2, 0.5, 0.2]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            )}
            <Flame
              className={`w-4 h-4 transition-all duration-700 ease-out ${hasActivityToday ? 'scale-110 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]' : 'scale-100'}`}
              style={{ 
                color: hasActivityToday ? '#F59E0B' : 
                       currentStreak > 0 ? 'rgba(245, 158, 11, 0.4)' : 
                       'rgba(255,255,255,0.15)'
              }}
            />
          </div>
          <span className={`text-[10px] font-bold tracking-[0.15em] ${hasActivityToday ? 'text-white' : 'text-white/40'}`}>
            {currentStreak}
          </span>
        </button>
      </div>

      {/* Centre: Title/Branding */}
      <div className="flex flex-col items-center">
         <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-white/20">
           Polished
         </span>
         <motion.div 
            key={mineralGrade}
            initial={{ y: 5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-[7px] font-black uppercase tracking-[0.3em]"
            style={{ color: gradeColor }}
         >
            {mineralGrade} Tier
         </motion.div>
      </div>

      {/* Right: Focus Reserve + Right toggle */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <AnimatePresence>
            {energyIncreased && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: [0, 0.4, 0], scale: [1, 1.4, 1.8] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5 }}
                className="absolute inset-0 bg-[#52B788]/20 blur-xl rounded-full"
              />
            )}
            {isLowEnergy && (
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: [0.1, 0.3, 0.1] }}
                 transition={{ duration: 2, repeat: Infinity }}
                 className="absolute -inset-2 bg-red-500/10 blur-xl rounded-full pointer-events-none"
               />
            )}
          </AnimatePresence>
          <FocusReserve
            units={energyUnits}
            lastResetDate={lastEnergyReset}
          />
        </div>

        <button
          onClick={onToggleRight}
          className="p-2 text-white/30 hover:text-white transition-colors active:scale-90"
          aria-label="Toggle activity panel"
        >
          <PanelRightOpen className="w-4 h-4" />
        </button>
      </div>

      {showStreakModal && (
        <StreakModal 
          isOpen={showStreakModal} 
          onClose={() => setShowStreakModal(false)} 
          currentStreak={currentStreak}
          userId={userId}
        />
      )}
    </header>
  );
}
