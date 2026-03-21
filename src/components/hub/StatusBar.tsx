'use client';

import { Flame, Menu, PanelRightOpen } from 'lucide-react';
import { EnergyBattery } from './EnergyBattery';
import { MINERAL_GRADES } from '@/lib/design-tokens';

interface Props {
  energyUnits: number;
  currentStreak: number;
  mineralGrade: string;
  lastEnergyReset: Date;
  onToggleLeft: () => void;
  onToggleRight: () => void;
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
}: Props) {
  const gradeColor = getGradeColor(mineralGrade);

  return (
    <header className="w-full h-12 bg-[#0a0a0c]/90 border-b border-white/5 backdrop-blur-xl flex items-center justify-between px-4 z-40 sticky top-0">
      {/* Left: Mobile hamburger + Streak */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleLeft}
          className="md:hidden p-2 text-white/30 hover:text-white transition-colors"
          aria-label="Toggle navigation"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1.5" title={`${currentStreak} day streak`}>
          <Flame
            className="w-4 h-4"
            style={{ color: currentStreak > 0 ? '#F59E0B' : 'rgba(255,255,255,0.15)' }}
          />
          <span className="text-[10px] font-bold tracking-[0.15em] text-white/40">
            {currentStreak}
          </span>
        </div>
      </div>

      {/* Centre: Mineral Grade */}
      <div className="flex items-center gap-2">
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: gradeColor, boxShadow: `0 0 8px ${gradeColor}44` }}
        />
        <span
          className="text-[10px] font-bold tracking-[0.2em] uppercase"
          style={{ color: gradeColor }}
        >
          {mineralGrade}
        </span>
      </div>

      {/* Right: Energy Battery + Mobile right toggle */}
      <div className="flex items-center gap-3">
        <EnergyBattery
          units={energyUnits}
          lastResetDate={lastEnergyReset}
        />

        <button
          onClick={onToggleRight}
          className="md:hidden p-2 text-white/30 hover:text-white transition-colors"
          aria-label="Toggle activity panel"
        >
          <PanelRightOpen className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
