'use client';

import { Flame, Menu, PanelRightOpen, Calendar } from 'lucide-react';
import { FocusReserve } from './FocusReserve';
import { MINERAL_GRADES } from '@/lib/design-tokens';
import { useState } from 'react';
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
  
  return (
    <header className="w-full h-12 bg-[#0a0a0c]/90 border-b border-white/5 backdrop-blur-xl flex items-center justify-between px-4 z-40 sticky top-0">
      {/* Left: Hamburger + Streak */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleLeft}
          className="p-2 text-white/30 hover:text-white transition-colors"
          aria-label="Toggle navigation"
        >
          <Menu className="w-4 h-4" />
        </button>

        <button 
          onClick={() => setShowStreakModal(true)}
          className="flex items-center gap-1.5 px-2 py-1 rounded-sm hover:bg-white/5 transition-colors" 
          title={`${currentStreak} day streak`}
        >
          <Flame
            className={`w-4 h-4 transition-all duration-500 ${hasActivityToday ? 'scale-110' : 'scale-100'}`}
            style={{ 
              color: hasActivityToday ? '#F59E0B' : 
                     currentStreak > 0 ? 'rgba(245, 158, 11, 0.4)' : 
                     'rgba(255,255,255,0.15)',
              filter: hasActivityToday ? 'drop-shadow(0 0 4px rgba(245, 158, 11, 0.4))' : 'none'
            }}
          />
          <span className={`text-[10px] font-bold tracking-[0.15em] ${hasActivityToday ? 'text-white' : 'text-white/40'}`}>
            {currentStreak}
          </span>
        </button>
      </div>

      {/* Centre: Title/Branding (Removed Quartz/Grade) */}
      <div className="flex items-center gap-2">
         <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-white/20">
           Polished
         </span>
      </div>

      {/* Right: Focus Reserve + Right toggle */}
      <div className="flex items-center gap-3">
        <FocusReserve
          units={energyUnits}
          lastResetDate={lastEnergyReset}
        />

        <button
          onClick={onToggleRight}
          className="p-2 text-white/30 hover:text-white transition-colors"
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
