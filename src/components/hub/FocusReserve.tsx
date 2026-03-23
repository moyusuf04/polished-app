'use client';

import { motion } from 'framer-motion';

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

export function FocusReserve({ units, maxUnits = 5 }: Props) {
  const isEmpty = units <= 0;
  const cells = Array.from({ length: maxUnits }, (_, i) => i < units);

  return (
    <div className="flex items-center gap-3">
      {/* Reserve Indicator */}
      <div className="flex items-center gap-1">
        {cells.map((filled, i) => (
          <motion.div
            key={i}
            initial={false}
            animate={{
              backgroundColor: filled ? '#52B788' : 'rgba(255,255,255,0.04)',
              height: filled ? '12px' : '8px',
              opacity: filled ? 1 : 0.3,
            }}
            className="w-[3px] rounded-full transition-all"
          />
        ))}
      </div>

      {/* Label */}
      <span className="text-[9px] font-bold tracking-[0.2em] uppercase whitespace-nowrap text-white/30">
        {isEmpty ? (
          <span className="text-amber-300/70">
            Recharge: {getTimeUntilReset()}
          </span>
        ) : (
          <span>Focus: {units} / {maxUnits}</span>
        )}
      </span>
    </div>
  );
}
