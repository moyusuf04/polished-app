import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock } from 'lucide-react';
import { NodeState } from './LessonNode';
import { MINERALS } from '@/lib/design-tokens';

interface PreviewProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (id: string) => void;
  lesson?: {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    category: string;
    duration?: string;
    format?: string;
    xp_reward?: number;
    state: NodeState;
    lockedReason?: string;
  };
}

export function PreviewDrawer({ isOpen, onClose, onStart, lesson }: PreviewProps) {
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

  const mineralKey = lesson ? categoryToMineral[lesson.category] || 'malachite' : 'malachite';
  const m = MINERALS[mineralKey];

  return (
    <AnimatePresence>
      {isOpen && lesson && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 35 }}
            className="fixed bottom-0 left-0 w-full z-50 bg-[#0d0d10] border-t border-white/10 shadow-2xl p-8 pb-12 rounded-t-sm"
          >
            {/* Mineral Accent Bar */}
            <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${m.light}, transparent)` }} />

            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-white/20 hover:text-white transition"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="max-w-lg mx-auto pt-4">
              <div className="mb-8">
                <span className="text-[10px] tracking-[0.2em] uppercase text-white/30 font-medium block mb-2">
                  {m.label} Track · {lesson.category}
                </span>
                <h2 className="text-4xl font-serif mb-6" style={{ color: m.light }}>
                  {lesson.title}
                </h2>
                
                {lesson.state === 'locked' ? (
                  <div className="flex items-center gap-4 p-5 bg-white/[0.02] border border-white/[0.05] rounded-sm">
                    <div className="p-3 bg-white/5 rounded-full">
                      <Lock className="w-5 h-5 text-white/20" />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Locked</h4>
                      <p className="text-white/40 text-sm mt-1">{lesson.lockedReason}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-white/50 text-base leading-relaxed font-light">
                    {lesson.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-6 mb-8 py-6 border-y border-white/5">
                {[
                  { label: "Duration", value: lesson.duration || "4 min" },
                  { label: "Format", value: lesson.format || "Bite-size" },
                  { label: "Reward", value: lesson.xp_reward ? `${lesson.xp_reward} XP` : "120 XP" }
                ].map(stat => (
                  <div key={stat.label}>
                    <p className="text-[9px] text-white/20 tracking-[0.15em] uppercase mb-1">{stat.label}</p>
                    <p className="text-sm font-medium text-white/70">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div>
                <button
                  onClick={() => lesson.state !== 'locked' && onStart(lesson.id)}
                  disabled={lesson.state === 'locked'}
                  className={`w-full py-4 px-8 text-xs font-bold tracking-widest uppercase rounded-sm transition-all border-b-4 ${
                    lesson.state === 'locked' 
                      ? 'bg-white/5 text-white/20 border-transparent cursor-not-allowed opacity-50'
                      : 'bg-white text-black border-zinc-300 active:translate-y-px active:border-b-0 hover:brightness-95 shadow-xl shadow-white/5'
                  }`}
                >
                  {lesson.state === 'locked' ? 'Locked' : lesson.state === 'completed' ? 'Review Lesson' : 'Begin Lesson →'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
