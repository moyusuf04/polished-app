import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SkillTree, LessonData } from './SkillTree';
import seedDataRaw from '@/data/seed_lessons.json';

// Cast the imported JSON to our precise interface
const lessonsData = seedDataRaw as unknown as LessonData[];
export interface CategoryData {
  id: string;
  name: string;
  theme_color: string;
}

interface Props {
  lessons: LessonData[];
  categories: CategoryData[];
  onSelectLesson: (id: string) => void;
  initialSelection?: string | null;
}

const ONBOARDING_MAP: Record<string, string> = {
  "Cultural literacy": "Etiquette & Presence",
  "Employment rights": "Financial Acumen",
  "Workplace dynamics": "Emotional Intelligence",
  "Networking": "Strategic Communication",
  "Sector knowledge": "Executive Presence",
  "Leadership presence": "Leadership & Influence"
};

export function PodHub({ lessons, categories, onSelectLesson, initialSelection }: Props) {
  // Only show categories that have at least one published lesson
  const populatedCategories = categories.filter(cat => 
    lessons.some(l => l.category_id === cat.id && !l.completed) || // Show if has lessons
    lessons.some(l => l.category_id === cat.id) // Fallback to any lessons if all completed
  ).filter(cat => lessons.some(l => l.category_id === cat.id)); // Hard filter for any lessons

  const [activeCategoryId, setActiveCategoryId] = useState<string>(() => {
    if (initialSelection && categories.length > 0) {
      const targetCategoryName = ONBOARDING_MAP[initialSelection];
      
      // 1. Exact Name Match
      let match = categories.find(c => c.name === targetCategoryName);
      if (match) return match.id;

      // 2. Substring Match (Case-insensitive)
      match = categories.find(c => c.name.toLowerCase().includes(initialSelection.toLowerCase()));
      if (match) return match.id;

      // 3. Fallback to first available category
      return categories[0]?.id || '';
    }
    return categories[0]?.id || '';
  });
  
  // Keep the active category ID in sync if categories load late
  if (!activeCategoryId && categories.length > 0) {
    setActiveCategoryId(categories[0].id);
  }

  const activeLessons = lessons.filter(l => l.category_id === activeCategoryId);

  return (
    <div className="w-full max-w-lg mx-auto py-20 px-6 relative min-h-screen">
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-serif text-white mb-4 tracking-tight drop-shadow-sm shimmer-text">Polished.</h1>
        <p className="text-white/40 text-lg font-sans font-light tracking-wide">Conversational breadth for the ambitious.</p>
      </div>

      <div className="w-full max-w-full overflow-x-auto no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-4 mb-12">
        <div className="flex flex-row items-center gap-3 px-2 w-max mx-auto">
          {populatedCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategoryId(cat.id)}
              className={
                activeCategoryId === cat.id 
                  ? 'rounded-sm bg-white text-black px-6 py-2.5 text-[10px] font-bold tracking-[0.15em] uppercase shrink-0 flex items-center gap-2 shadow-xl shadow-white/5 border-b-[3px] border-zinc-300' 
                  : 'rounded-sm bg-transparent text-white/30 border border-white/5 px-6 py-2.5 text-[10px] font-bold tracking-[0.15em] uppercase shrink-0 hover:border-white/20 hover:text-white/50 transition-all flex items-center gap-2'
              }
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.theme_color }} />
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="relative pl-2 pr-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategoryId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {activeLessons.length > 0 ? (
              <SkillTree lessons={activeLessons} onStartLesson={onSelectLesson} allLessons={lessons} />
            ) : (
              <div className="py-20 px-10 border border-white/5 bg-white/[0.02] rounded-sm backdrop-blur-sm text-center">
                <p className="text-white/40 text-sm font-sans font-light leading-relaxed">
                  The archives for this track are currently being curated.<br />
                  <span className="text-[10px] tracking-[0.2em] uppercase mt-4 block text-white/20">Check back soon for new insights.</span>
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      
    </div>
  );
}
