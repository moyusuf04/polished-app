import { useState } from 'react';
import { LessonNode, NodeState } from './LessonNode';
import { PreviewDrawer } from './PreviewDrawer';

export interface LessonData {
  id: string;
  title: string;
  category_id: string;
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
  lessons: LessonData[];     // Lessons mapped to the currently active category tab
  allLessons: LessonData[];  // Complete global catalog for resolving cross-category prerequisites
  onStartLesson: (id: string) => void;
}

export function SkillTree({ lessons, allLessons, onStartLesson }: Props) {
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  // Helper to determine node state globally
  const getNodeState = (lesson: LessonData): NodeState => {
    if (lesson.completed) return 'completed';

    // A lesson is unlocked only if ALL prerequisites across ALL categories are completed
    const allPrereqsMet = lesson.prerequisites.every((prereqId) => {
      const p = allLessons.find((l) => l.id === prereqId);
      return p?.completed === true;
    });

    return allPrereqsMet ? 'unlocked' : 'locked';
  };

  const getLockedReason = (lesson: LessonData): string | undefined => {
    const missing = lesson.prerequisites.find((pid) => !allLessons.find(l => l.id === pid)?.completed);
    if (!missing) return undefined;
    const prereq = allLessons.find(l => l.id === missing);
    return `Requires: ${prereq?.title}`;
  };

  const selectedLesson = allLessons.find((l) => l.id === selectedLessonId);
  const selectedLessonState = selectedLesson ? getNodeState(selectedLesson) : 'locked';

  // Empty State
  if (lessons.length === 0) {
    return (
      <div className="w-full flex-1 flex items-center justify-center p-12">
        <p className="text-zinc-500 font-medium tracking-wide">More lessons coming soon.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full pb-32 flex flex-col items-center">
      {/* Vertical Spine */}
      <div className="absolute left-1/2 top-0 bottom-32 w-[0.5px] bg-white/5 -translate-x-1/2" />
      
      <div className="flex flex-col items-center w-full relative z-10 transition-all">
        {lessons.map((lesson, idx) => (
          <LessonNode
            key={lesson.id}
            id={lesson.id}
            title={lesson.title}
            category={lesson.category}
            state={getNodeState(lesson)}
            onClick={setSelectedLessonId}
            index={idx}
          />
        ))}
      </div>

      <PreviewDrawer
        isOpen={!!selectedLessonId}
        onClose={() => setSelectedLessonId(null)}
        onStart={onStartLesson}
        lesson={
          selectedLesson
            ? {
                ...selectedLesson,
                state: selectedLessonState,
                lockedReason: getLockedReason(selectedLesson),
              }
            : undefined
        }
      />
    </div>
  );
}
