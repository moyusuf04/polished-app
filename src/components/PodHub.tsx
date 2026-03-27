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
          <AnimatePresence>
            {activeCategories.map(cat => (
              <motion.div 
                key={cat.id} 
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="px-4 py-1 rounded-full border border-white/5 bg-white/[0.03] flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.theme_color }} />
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/40">{cat.name}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {noVisibleCategories ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-40 text-center">
           <p className="text-[11px] font-bold tracking-[0.4em] uppercase text-white/10">The canvas awaits its first track</p>
        </motion.div>
      ) : (
        <div className="max-w-5xl mx-auto relative pb-40">
          
          {/* SVG Connections Layer */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-visible">
            <svg className="w-full h-full overflow-visible">
              <defs>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="glow"/>
                  <feComposite in="glow" in2="SourceGraphic" operator="over"/>
                </filter>
                <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                  <stop offset="50%" stopColor="rgba(255,255,255,0.2)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </linearGradient>
              </defs>
              {positions.map((pos, rowIndex) => {
                const nextPos = positions[rowIndex + 1];
                if (!nextPos) return null;
                
                const currentLessons = activeLessons.filter(l => l.position === pos);
                const nextLessons = activeLessons.filter(l => l.position === nextPos);

                return currentLessons.map(curr => {
                  const currCats = (curr.category_ids || [curr.category_id]).filter(id => visibleCategories[id] !== false);
                  const currIdxs = currCats.map(id => activeCategories.findIndex(c => c.id === id)).filter(i => i !== -1);
                  if (currIdxs.length === 0) return null;
                  
                  const startX = `${((Math.min(...currIdxs) + Math.max(...currIdxs)) / 2 + 0.5) / activeCategories.length * 100}%`;
                  const startY = (rowIndex * 192) + 112;

                  return nextLessons.filter(nxt => nxt.prerequisites?.includes(curr.id)).map(nxt => {
                    const nxtCats = (nxt.category_ids || [nxt.category_id]).filter(id => visibleCategories[id] !== false);
                    const nxtIdxs = nxtCats.map(id => activeCategories.findIndex(c => c.id === id)).filter(i => i !== -1);
                    if (nxtIdxs.length === 0) return null;

                    const endX = `${((Math.min(...nxtIdxs) + Math.max(...nxtIdxs)) / 2 + 0.5) / activeCategories.length * 100}%`;
                    const endY = ((rowIndex + 1) * 192) + 80;

                    const isUnlocked = getNodeState(nxt) !== 'prerequisite_locked';

                    return (
                      <g key={`${curr.id}-${nxt.id}`}>
                        <motion.path
                          d={`M ${startX} ${startY} C ${startX} ${startY + 60}, ${endX} ${endY - 60}, ${endX} ${endY}`}
                          stroke={isUnlocked ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)'}
                          strokeWidth="2"
                          fill="none"
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{ pathLength: 1, opacity: 1 }}
                          transition={{ duration: 1.5, ease: "easeInOut" }}
                          style={isUnlocked ? { filter: 'url(#glow)' } : {}}
                        />
                        {isUnlocked && (
                          <motion.path
                            d={`M ${startX} ${startY} C ${startX} ${startY + 60}, ${endX} ${endY - 60}, ${endX} ${endY}`}
                            stroke="rgba(255,255,255,0.4)"
                            strokeWidth="1"
                            strokeDasharray="10, 20"
                            fill="none"
                            animate={{ strokeDashoffset: [-100, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                          />
                        )}
                      </g>
                    );
                  });
                });
              })}
            </svg>
          </div>

          <motion.div 
            layout
            transition={{ type: 'spring', stiffness: 200, damping: 25, mass: 1.2 }}
            className="space-y-48 relative z-10"
          >
            {positions.map((pos) => {
              const rowLessons = activeLessons.filter(l => l.position === pos);
              return (
                <motion.div 
                  layout
                  key={pos} 
                  className="relative min-h-[100px]"
                >
                  <motion.div 
                    layout
                    transition={{ type: 'spring', stiffness: 150, damping: 20 }}
                    className="grid w-full items-center justify-items-center gap-y-12" 
                    style={{ gridTemplateColumns: `repeat(${activeCategories.length}, 1fr)` }}
                  >
                    {rowLessons.map(lesson => {
                      const lCats = (lesson.category_ids || [lesson.category_id]).filter(id => visibleCategories[id] !== false);
                      const state = getNodeState(lesson);
                      const isLockedWall = isSignupRequired && pos >= 5;
                      
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
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                          className="flex flex-col items-center gap-4 w-full relative group"
                        >
                          <GridNode 
                            lesson={lesson} 
                            state={state} 
                            isLockedByWall={isLockedWall} 
                            onClick={() => (state !== 'prerequisite_locked' && !isLockedWall) && setSelectedId(lesson.id)} 
                          />
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
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

  const lCats = lesson.category_ids && lesson.category_ids.length > 0 ? lesson.category_ids : [lesson.category_id];
  const isBridge = lCats.length > 1;
  const mineralKey = categoryToMineral[lesson.category] || 'malachite';
  const m = MINERALS[mineralKey];
  
  // For bridge nodes, pick two colors
  const m2 = isBridge && lesson.category_ids ? (categoryToMineral[lesson.category_ids[1]] ? MINERALS[categoryToMineral[lesson.category_ids[1]] as keyof typeof MINERALS] : m) : m;

  const isLocked = state === 'prerequisite_locked' || isLockedByWall;
  const isCompleted = state === 'completed';

  return (
    <div 
      className={`flex flex-col items-center gap-5 transition-all duration-500 cursor-pointer ${isLocked ? 'opacity-30 grayscale cursor-not-allowed' : 'opacity-100 hover:scale-105'}`}
      onClick={onClick}
    >
      <div className="relative group/node">
        {/* Outer Glow / Ring */}
        <div className={`absolute -inset-3 rounded-full blur-2xl opacity-0 group-hover/node:opacity-40 transition-opacity duration-700 -z-10`}
          style={{ 
            background: isBridge 
              ? `linear-gradient(135deg, ${m.light}, ${m2.light})` 
              : m.light 
          }}
        />

        {/* Progress Ring */}
        <div className={`absolute -inset-1.5 ${isBridge ? '' : 'rounded-full'} border border-white/5 bg-black -z-1`} 
          style={isBridge ? { clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)' } : {}}
        />
        
        {isCompleted && (
          <div className={`absolute -inset-1.5 ${isBridge ? '' : 'rounded-full'} border border-emerald-500/30 -z-1`}
            style={isBridge ? { clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)' } : {}}
          />
        )}

        {state === 'unlocked' && !isLockedByWall && (
           <motion.div 
             className={`absolute -inset-2.5 ${isBridge ? '' : 'rounded-full'} border border-white/20`}
             style={isBridge ? { clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)' } : {}}
             animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.1, 0.3] }}
             transition={{ duration: 3, repeat: Infinity }}
           />
        )}

        <div 
          className={`relative ${isBridge ? 'w-20 h-20' : 'w-16 h-16'} ${isBridge ? '' : 'rounded-full'} flex items-center justify-center border border-white/10 relative overflow-hidden transition-all duration-500`}
          style={{ 
            background: isCompleted 
              ? `linear-gradient(135deg, ${m.dark}aa, ${m.light}44)` 
              : isLocked 
              ? 'rgba(255,255,255,0.03)' 
              : isBridge 
                ? `linear-gradient(135deg, ${m.dark}, ${m2.dark})`
                : `linear-gradient(135deg, ${m.dark}, ${m.light}cc)`,
            borderColor: !isLocked ? m.light : 'rgba(255,255,255,0.1)',
            clipPath: isBridge ? 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)' : undefined,
            boxShadow: isBridge ? `0 0 30px ${m.light}22, 0 0 30px ${m2.light}22` : 'none'
          }}
        >
          {isCompleted ? (
            <Check className={`${isBridge ? 'w-8 h-8' : 'w-6 h-6'} text-white`} />
          ) : isLocked ? (
            <Lock className={`${isBridge ? 'w-6 h-6' : 'w-5 h-5'} text-white/20`} />
          ) : (
            <motion.div 
              className={`${isBridge ? 'w-4 h-4' : 'w-2.5 h-2.5'} rounded-full bg-white shadow-[0_0_15px_white]`}
              animate={isBridge ? { 
                boxShadow: [`0 0 10px ${m.light}`, `0 0 20px ${m2.light}`, `0 0 10px ${m.light}`],
                scale: [1, 1.2, 1]
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
          
          {/* Bi-chromatic shimmer for Nexuses */}
          {isBridge && (
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 opacity-20 bg-gradient-to-tr from-transparent via-white/40 to-transparent pointer-events-none" 
            />
          )}
        </div>
      </div>

      <div className="text-center max-w-[140px] px-2">
        <h3 className="text-[13px] font-serif text-white leading-tight mb-1">{lesson.title}</h3>
        <p className="text-[9px] text-white/20 uppercase tracking-[0.2em] font-bold">
          {isBridge ? 'Hybrid Node' : `Slot ${lesson.position + 1}`}
        </p>
      </div>
    </div>
  );
}

export function PodHub(props: Props) {
  return <HubCanvas {...props} />;
}
