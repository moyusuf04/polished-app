'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { NodeState } from './LessonNode';
import { PreviewDrawer } from './PreviewDrawer';
import { Check, Lock } from 'lucide-react';
import { useGuestAuth } from '@/hooks/useGuestAuth';
import { MINERALS } from '@/lib/design-tokens';

export interface CategoryData {
  id: string;
  name: string;
  theme_color: string;
}

export interface LessonData {
  id: string;
  title: string;
  category_id: string;
  category_ids?: string[];
  category: string;
  difficulty: string;
  description: string;
  prerequisites: string[];
  completed: boolean;
  content_slides: { type: string; text: string }[];
  convo_hooks: string[];
  reflection_prompt: string;
  position: number;
  duration?: string;
  format?: string;
  xp_reward?: number;
}

interface Props {
  lessons: LessonData[];
  categories: CategoryData[];
  visibleCategories: Record<string, boolean>;
  onSelectLesson: (id: string) => void;
  initialSelection?: string | null;
  energyUnits: number;
}

export function HubCanvas({
  lessons,
  categories,
  visibleCategories,
  onSelectLesson,
}: Props) {
  const [selectedLessonId, setSelectedId] = useState<string | null>(null);
  const { isSignupRequired } = useGuestAuth();

  const activeCategories = categories.filter(cat => visibleCategories[cat.id] !== false);
  const noVisibleCategories = activeCategories.length === 0;

  const isLessonVisible = (lesson: LessonData) => {
    const ids = lesson.category_ids || [lesson.category_id];
    return ids.some(id => visibleCategories[id] !== false);
  };

  const activeLessons = lessons.filter(isLessonVisible);
  const positions = Array.from(new Set(activeLessons.map(l => l.position))).sort((a,b) => a-b);

  const getNodeState = (lesson: LessonData): NodeState => {
    if (lesson.completed) return 'completed';
    // Progression logic: All prerequisites must be completed
    const arePrereqsMet = (l: LessonData): boolean => {
      if (!l.prerequisites || l.prerequisites.length === 0) return true;
      return l.prerequisites.every(pid => {
        const p = lessons.find(lx => lx.id === pid);
        if (!p) return true; // Missing prereq is treated as met or ignored
        return p.completed && arePrereqsMet(p);
      });
    };
    return arePrereqsMet(lesson) ? 'unlocked' : 'prerequisite_locked';
  };

  const getLockedReason = (lesson: LessonData): string | undefined => {
    const missing = lesson.prerequisites?.find((pid) => !lessons.find(l => l.id === pid)?.completed);
    if (!missing) return undefined;
    const prereq = lessons.find(l => l.id === missing);
    return `Requires: ${prereq?.title}`;
  };

  const selectedLesson = lessons.find(l => l.id === selectedLessonId);

  return (
    <div className="w-full min-h-full py-16 px-6 relative overflow-x-hidden">
      {/* Dynamic Background Mesh */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.02)_0%,transparent_50%)]" />

      <div className="mb-20 text-center space-y-4">
        <h1 className="text-6xl font-serif text-white tracking-tighter shimmer-text">
          Polished.
        </h1>
        <div className="flex flex-wrap justify-center gap-4 py-4">
          {activeCategories.map(cat => (
            <div key={cat.id} className="px-4 py-1 rounded-full border border-white/5 bg-white/[0.03] flex items-center gap-2">
              <div className="w-1 h-1 rounded-full" style={{ backgroundColor: cat.theme_color }} />
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/40">{cat.name}</span>
            </div>
          ))}
        </div>
      </div>

      {noVisibleCategories ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-40 text-center">
           <p className="text-[11px] font-bold tracking-[0.4em] uppercase text-white/10">The canvas awaits its first track</p>
        </motion.div>
      ) : (
        <div className="max-w-5xl mx-auto relative pb-40">
          
          {/* Vertical Track Lines */}
          <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none opacity-[0.03]">
             <div className="h-full w-full flex justify-between px-[10%]">
                {activeCategories.map((_, i) => (
                   <div key={i} className="w-[1px] bg-white h-full" />
                ))}
             </div>
          </div>

          <div className="space-y-48 relative z-10">
            {positions.map((pos) => {
              const rowLessons = activeLessons.filter(l => l.position === pos);
              return (
                <div key={pos} className="relative min-h-[100px]">
                  <div 
                    className="grid w-full items-center justify-items-center gap-y-12" 
                    style={{ gridTemplateColumns: `repeat(${activeCategories.length}, 1fr)` }}
                  >
                    {rowLessons.map(lesson => {
                      const lCats = (lesson.category_ids || [lesson.category_id]).filter(id => visibleCategories[id] !== false);
                      const state = getNodeState(lesson);
                      const isLockedWall = isSignupRequired && pos >= 5; // Allow more lessons before wall
                      
                      const colIndices = lCats.map(id => activeCategories.findIndex(c => c.id === id)).filter(idx => idx !== -1);
                      const minCol = Math.min(...colIndices);
                      const maxCol = Math.max(...colIndices);
                      const colSpan = maxCol - minCol + 1;

                      const gridStyle = {
                        gridColumnStart: minCol + 1,
                        gridColumnEnd: `span ${colSpan}`
                      };

                      return (
                        <motion.div 
                          layout
                          key={lesson.id} 
                          style={gridStyle}
                          className="flex flex-col items-center gap-4 w-full relative group"
                        >
                          <GridNode 
                            lesson={lesson} 
                            state={state} 
                            isLockedByWall={isLockedWall} 
                            onClick={() => (state !== 'prerequisite_locked' && !isLockedWall) && setSelectedId(lesson.id)} 
                          />
                          
                          {/* Cross-track link Indicator */}
                          {lCats.length > 1 && (
                            <div className="absolute inset-0 -z-10 -mx-10 scale-x-110 pointer-events-none">
                               <div className="h-full w-full border border-white/[0.03] rounded-3xl bg-white/[0.01] overflow-hidden">
                                  <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/[0.02] to-transparent" />
                               </div>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <PreviewDrawer
        isOpen={!!selectedLessonId}
        onClose={() => setSelectedId(null)}
        onStart={onSelectLesson}
        lesson={selectedLesson ? {
          ...selectedLesson,
          state: getNodeState(selectedLesson),
          lockedReason: getLockedReason(selectedLesson)
        } : undefined}
      />
    </div>
  );
}

/**
 * Optimized Grid Node for the Multi-track Canvas
 */
function GridNode({ lesson, state, isLockedByWall, onClick }: { lesson: LessonData, state: NodeState, isLockedByWall: boolean, onClick: () => void }) {
  const categoryToMineral: Record<string, keyof typeof MINERALS> = {
    'Art': 'malachite', 'Film': 'lapis', 'Sport': 'tigersEye', 'History': 'amethyst', 'Culture': 'roseQuartz',
    'Etiquette & Presence': 'malachite', 'Strategic Communication': 'lapis', 'Financial Acumen': 'tigersEye',
    'Leadership & Influence': 'amethyst', 'Executive Presence': 'obsidian', 'Emotional Intelligence': 'roseQuartz',
  };

  const mineralKey = categoryToMineral[lesson.category] || 'malachite';
  const m = MINERALS[mineralKey];
  const isLocked = state === 'prerequisite_locked' || isLockedByWall;
  const isCompleted = state === 'completed';

  return (
    <div 
      className={`flex flex-col items-center gap-5 transition-all duration-500 cursor-pointer ${isLocked ? 'opacity-30 grayscale cursor-not-allowed' : 'opacity-100 hover:scale-105'}`}
      onClick={onClick}
    >
      <div className="relative">
        {/* Progress Ring */}
        <div className="absolute -inset-1.5 rounded-full border border-white/5 bg-black -z-1" />
        {isCompleted && <div className="absolute -inset-1.5 rounded-full border border-emerald-500/30 -z-1" />}
        {state === 'unlocked' && !isLockedByWall && (
           <motion.div 
             className="absolute -inset-2 rounded-full border border-white/20"
             animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
             transition={{ duration: 3, repeat: Infinity }}
           />
        )}

        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center border border-white/10 relative overflow-hidden"
          style={{ 
            background: isCompleted 
              ? `linear-gradient(135deg, ${m.dark}aa, ${m.light}44)` 
              : isLocked 
              ? 'rgba(255,255,255,0.03)' 
              : `linear-gradient(135deg, ${m.dark}, ${m.light}cc)`,
            borderColor: !isLocked ? m.light : 'rgba(255,255,255,0.1)'
          }}
        >
          {isCompleted ? <Check className="w-6 h-6 text-white" /> : isLocked ? <Lock className="w-5 h-5 text-white/20" /> : <div className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_10px_white]" />}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
        </div>
      </div>

      <div className="text-center max-w-[140px] px-2">
        <h3 className="text-[13px] font-serif text-white leading-tight mb-1">{lesson.title}</h3>
        <p className="text-[9px] text-white/20 uppercase tracking-[0.2em] font-bold">Slot {lesson.position + 1}</p>
      </div>
    </div>
  );
}

export function PodHub(props: Props) {
  return <HubCanvas {...props} />;
}
