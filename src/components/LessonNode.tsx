import { Check, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { MINERALS } from '@/lib/design-tokens';

export type NodeState = 'completed' | 'unlocked' | 'locked';

interface Props {
  id: string;
  title: string;
  category: string;
  state: NodeState;
  onClick: (id: string) => void;
  index: number;
}

export function LessonNode({ id, title, category, state, onClick, index }: Props) {
  // Map category name to mineral key
  const categoryToMineral: Record<string, keyof typeof MINERALS> = {
    'Art': 'malachite',
    'Film': 'lapis',
    'Sport': 'tigersEye',
    'History': 'amethyst',
    'Culture': 'roseQuartz',
    'Etiquette & Presence': 'malachite',
    'Strategic Communication': 'lapis',
    'Financial Acumen': 'tigersEye',
    'Leadership & Influence': 'amethyst',
    'Executive Presence': 'obsidian',
    'Emotional Intelligence': 'roseQuartz',
  };

  const mineralKey = categoryToMineral[category] || 'malachite';
  const m = MINERALS[mineralKey];
  const isLeft = index % 2 === 0;

  let buttonClass = 'relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 transform outline-none z-10 border border-white/10';
  let innerContent = null;
  let pulseEffect = null;

  if (state === 'completed') {
    buttonClass += ` opacity-90 scale-95 shadow-inner`;
    innerContent = <Check className="w-6 h-6" style={{ color: m.light }} strokeWidth={3} />;
  } else if (state === 'unlocked' || state === 'active' as any) {
    buttonClass += ` active ring-2 ring-white/10`;
    innerContent = <div className="w-2 h-2 rounded-full" style={{ backgroundColor: m.light }} />;
    pulseEffect = (
      <motion.div 
        className="absolute -inset-1 rounded-full border border-white/20"
        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
      />
    );
  } else {
    buttonClass += ` bg-white/5 opacity-40 cursor-not-allowed`;
    innerContent = <Lock className="w-4 h-4 text-white/30" />;
  }

  const bgGradient = state === 'completed'
    ? `linear-gradient(135deg, ${m.dark}cc, ${m.light}44)`
    : state === 'unlocked' || state === 'active' as any
    ? `linear-gradient(135deg, ${m.dark}, ${m.light}88)`
    : "rgba(255,255,255,0.04)";

  return (
    <div 
      className={`flex items-center gap-6 py-6 cursor-pointer w-full max-w-sm ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}
      style={{ opacity: state === 'locked' ? 0.35 : 1 }}
      onClick={() => state !== 'locked' && onClick(id)}
    >
      <div className={`flex-1 ${isLeft ? 'text-right' : 'text-left'}`}>
        <p className={`font-serif text-sm leading-tight transition-colors ${state === 'unlocked' ? '' : 'text-white/70'}`} style={{ color: state === 'unlocked' ? m.light : undefined }}>
          {title}
        </p>
        <p className="text-[10px] text-white/20 tracking-widest mt-1 uppercase font-medium">120 XP</p>
      </div>

      <div 
        className={buttonClass}
        style={{ 
          background: bgGradient,
          borderColor: (state === 'unlocked' || state === 'active' as any) ? m.light : 'rgba(255,255,255,0.1)' 
        }}
      >
        {pulseEffect}
        {innerContent}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-full" />
      </div>

      <div className="flex-1" />
    </div>
  );
}
