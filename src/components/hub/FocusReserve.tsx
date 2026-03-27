'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

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
  const isRecharging = units < maxUnits;
  
  // Track previous units to trigger drain effect
  const [prevUnits, setPrevUnits] = useState(units);
  useEffect(() => {
    if (units < prevUnits) {
       // Trigger drain effect
    }
    setPrevUnits(units);
  }, [units, prevUnits]);

  return (
    <div className="flex items-center gap-4 bg-white/[0.02] border border-white/5 rounded-full px-4 py-2 backdrop-blur-md relative group">
      {/* Reserve Indicator */}
      <div className="flex items-center gap-1.5 h-4">
        {Array.from({ length: maxUnits }).map((_, i) => {
          const filled = i < units;
          const isNextToFill = i === units;
          const wasFilled = i < prevUnits;
          const justEmptied = wasFilled && !filled;
          
          return (
            <motion.div
              key={i}
              initial={false}
              animate={{
                backgroundColor: filled ? '#52B788' : 'rgba(255,255,255,0.04)',
                height: filled ? '12px' : '8px',
                opacity: filled ? 1 : 0.2,
                boxShadow: filled ? '0 0 10px rgba(82, 183, 136, 0.3)' : 'none',
              }}
              transition={{ 
                type: 'spring', 
                stiffness: 300, 
                damping: 20
              }}
              className="w-[4px] rounded-full relative"
            >
              {isNextToFill && isRecharging && (
                <motion.div 
                  className="absolute inset-0 bg-[#52B788] rounded-full"
                  animate={{ opacity: [0.1, 0.4, 0.1], scaleY: [1, 1.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
              
              {/* Drain Particles */}
              <AnimatePresence>
                {justEmptied && (
                   <>
                     {[1,2,3].map(p => (
                       <motion.div
                         key={p}
                         initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                         animate={{ opacity: 0, scale: 0, x: (p - 2) * 15, y: -20 }}
                         exit={{ opacity: 0 }}
                         className="absolute top-0 left-0 w-1 h-1 bg-[#52B788] rounded-full blur-[1px]"
                       />
                     ))}
                   </>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Label & Timer */}
      <div className="flex flex-col">
        <span className="text-[9px] font-bold tracking-[0.2em] uppercase whitespace-nowrap text-white/40 group-hover:text-white/70 transition-colors">
          Focus
        </span>
        <span className="text-[10px] font-medium text-white/20 tabular-nums">
          {isEmpty ? (
            <span className="text-amber-400/60 lowercase italic">Recharging...</span>
          ) : (
            <span>{Math.floor(units)} units</span>
          )}
        </span>
      </div>

      {isEmpty && (
        <div className="absolute -inset-0.5 rounded-full border border-amber-500/20 animate-pulse pointer-events-none" />
      )}
    </div>
  );
}
