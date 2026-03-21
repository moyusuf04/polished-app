'use client';

import { motion } from 'framer-motion';
import { MINERAL_GRADES } from '@/lib/design-tokens';

interface Props {
  units: number;
  maxUnits?: number;
  lastResetDate: Date;
}

/** Returns "X hrs" until midnight UTC reset. */
function getTimeUntilReset(): string {
  const now = new Date();
  const nextReset = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0, 0, 0
  ));
  const diffMs = nextReset.getTime() - now.getTime();
  const hours = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));
  return `${hours} hr${hours !== 1 ? 's' : ''}`;
}

export function EnergyBattery({ units, maxUnits = 5 }: Props) {
  const isEmpty = units <= 0;
  const cells = Array.from({ length: maxUnits }, (_, i) => i < units);

  return (
    <div className="flex items-center gap-2">
      {/* Battery cells */}
      <div className="flex items-center gap-[2px] bg-white/5 rounded-sm p-[3px] border border-white/10">
        {cells.map((filled, i) => (
          <motion.div
            key={i}
            initial={false}
            animate={{
              backgroundColor: filled ? '#52B788' : 'rgba(255,255,255,0.04)',
              scale: filled ? 1 : 0.85,
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="w-[6px] h-[14px] rounded-[1px]"
          />
        ))}
        {/* Terminal nub */}
        <div className="w-[3px] h-[8px] bg-white/10 rounded-r-sm ml-[1px]" />
      </div>

      {/* Label */}
      <span className="text-[9px] font-bold tracking-[0.15em] uppercase whitespace-nowrap">
        {isEmpty ? (
          <span className="text-amber-300/70">
            Recharges in {getTimeUntilReset()}
          </span>
        ) : (
          <span className="text-white/30">{units}/{maxUnits}</span>
        )}
      </span>
    </div>
  );
}
