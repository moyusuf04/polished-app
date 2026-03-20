import { useState } from 'react';
import { NodeState } from './LessonNode';
import { PreviewDrawer } from './PreviewDrawer';
import { HubGrid } from './hub/HubGrid';

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
    // Recursive Prerequisite Validation
    const areAllPrereqsMetRecursive = (lessonId: string, visited = new Set<string>()): boolean => {
      if (visited.has(lessonId)) return true; // prevent infinite loop if cycle exists somehow
      visited.add(lessonId);
      
      const current = allLessons.find(l => l.id === lessonId);
      if (!current) return true;
      
      return current.prerequisites.every(prereqId => {
        const prereq = allLessons.find(l => l.id === prereqId);
        if (!prereq) return true;
        return prereq.completed && areAllPrereqsMetRecursive(prereqId, visited);
      });
    };

    const allPrereqsMet = areAllPrereqsMetRecursive(lesson.id);

    return allPrereqsMet ? 'unlocked' : 'prerequisite_locked';
  };

  const getLockedReason = (lesson: LessonData): string | undefined => {
    const missing = lesson.prerequisites.find((pid) => !allLessons.find(l => l.id === pid)?.completed);
    if (!missing) return undefined;
    const prereq = allLessons.find(l => l.id === missing);
    return `Requires: ${prereq?.title}`;
  };

  const selectedLesson = allLessons.find((l) => l.id === selectedLessonId);
  const selectedLessonState = selectedLesson ? getNodeState(selectedLesson) : 'prerequisite_locked';

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
      
      <HubGrid 
        lessons={lessons} 
        getNodeState={getNodeState} 
        onSelectLesson={setSelectedLessonId} 
      />

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
