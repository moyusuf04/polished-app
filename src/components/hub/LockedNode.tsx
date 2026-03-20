import React from 'react';
import { Lock } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  id: string;
  title: string;
  category: string;
  index: number;
}

export const LockedNode = ({ title, category, index }: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative w-full max-w-sm mx-auto mb-12"
    >
      <div className="group relative p-8 bg-[#0d0d10]/40 border border-[#D4A017]/30 rounded-sm backdrop-blur-md overflow-hidden grayscale opacity-60 cursor-not-allowed">
        {/* Gold border accent */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4A017] to-transparent" />
        
        <div className="flex items-start justify-between mb-8">
          <div>
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#D4A017] uppercase mb-2 block">
              Locked
            </span>
            <h3 className="text-xl font-serif text-white/40 tracking-tight group-hover:text-white/60 transition-colors">
              {title}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-full border border-[#D4A017]/20 flex items-center justify-center bg-[#D4A017]/5">
            <Lock className="w-4 h-4 text-[#D4A017]" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-[9px] font-bold tracking-[0.2em] text-white/10 uppercase">
            {category}
          </span>
          <div className="h-[1px] flex-1 bg-white/5" />
          <span className="text-[9px] font-bold tracking-[0.2em] text-[#D4A017] uppercase">
            Upgrade Required
          </span>
        </div>
      </div>
    </motion.div>
  );
};
