import { AnimatePresence, motion } from 'framer-motion';
import { SkillTree, LessonData } from './SkillTree';

export interface CategoryData {
  id: string;
  name: string;
  theme_color: string;
}

interface Props {
  lessons: LessonData[];
  categories: CategoryData[];
  visibleCategories: Record<string, boolean>;
  onSelectLesson: (id: string) => void;
  initialSelection?: string | null;
  energyUnits: number;
}

/**
 * HubCanvas — The Dynamic Centre Field
 *
 * Renders multiple skill trees simultaneously, one per visible category.
 * Auto-centres remaining trees when categories are toggled off.
 * Shows an empty state prompt when zero categories are visible.
 */
export function HubCanvas({
  lessons,
  categories,
  visibleCategories,
  onSelectLesson,
  energyUnits,
}: Props) {
  // Helper to check if a lesson belongs to a category (taking hybrid nodes into account)
  const isLessonInCategory = (lesson: LessonData, catId: string) => {
    if (lesson.category_ids && lesson.category_ids.length > 0) {
      return lesson.category_ids.includes(catId);
    }
    return lesson.category_id === catId;
  };

  // Filter to visible categories that have lessons
  const activeCategories = categories.filter(
    (cat) => visibleCategories[cat.id] !== false && lessons.some((l) => isLessonInCategory(l, cat.id))
  );

  const noVisibleCategories = activeCategories.length === 0;

  return (
    <div className="w-full min-h-full py-10 px-4 md:px-8 relative">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-serif text-white mb-3 tracking-tight drop-shadow-sm shimmer-text">
          Polished.
        </h1>
        <p className="text-white/40 text-base md:text-lg font-sans font-light tracking-wide">
          Conversational breadth for the ambitious.
        </p>
      </div>

      {/* Empty canvas state */}
      {noVisibleCategories ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-20 px-10 border border-white/5 bg-white/[0.02] rounded-sm backdrop-blur-sm text-center max-w-md mx-auto"
        >
          <p className="text-white/40 text-sm font-sans font-light leading-relaxed">
            Select a track from the left panel to begin.
          </p>
          <span className="text-[10px] tracking-[0.2em] uppercase mt-4 block text-white/20">
            Toggle categories to mount skill trees.
          </span>
        </motion.div>
      ) : (
        /* Multi-tree grid — auto-centring flex container */
        <div
          className="flex flex-wrap justify-center gap-8 md:gap-12 transition-all duration-500 ease-in-out"
        >
          <AnimatePresence mode="popLayout">
            {activeCategories.map((cat) => {
              const catLessons = lessons.filter((l) => isLessonInCategory(l, cat.id));
              if (catLessons.length === 0) return null;

              return (
                <motion.div
                  key={cat.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="w-full max-w-sm flex-shrink-0"
                >
                  {/* Category label */}
                  <div className="flex items-center gap-2 mb-6 px-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: cat.theme_color }}
                    />
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/30">
                      {cat.name}
                    </span>
                  </div>

                  <SkillTree
                    lessons={catLessons}
                    allLessons={lessons}
                    onStartLesson={onSelectLesson}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// Re-export for backward compat (the old PodHub default)
export function PodHub(props: Props & { initialSelection?: string | null }) {
  return <HubCanvas {...props} />;
}
