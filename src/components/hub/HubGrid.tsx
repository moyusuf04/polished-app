import React from 'react';
import { useGuestAuth } from '@/hooks/useGuestAuth';
import { LessonNode, NodeState } from '../LessonNode';
import { LockedNode } from './LockedNode';
import { LessonData } from '../SkillTree';

interface Props {
  lessons: LessonData[];
  getNodeState: (lesson: LessonData) => NodeState;
  onSelectLesson: (id: string) => void;
}

export const HubGrid = ({ lessons, getNodeState, onSelectLesson }: Props) => {
  const { isSignupRequired } = useGuestAuth();

  return (
    <div className="flex flex-col items-center w-full relative z-10 transition-all">
      {lessons.map((lesson, idx) => {
        const state = getNodeState(lesson);
        const isLockedByWall = isSignupRequired && idx >= 3;
        
        // 1. Check if prerequisites are met first (Progression Hardening)
        // If the state is 'prerequisite_locked', it means prerequisites are NOT met.
        // We show the standard grey lock node in this case to prioritize curriculum logic.
        if (state === 'prerequisite_locked' || state === 'locked') {
          return (
            <LessonNode
              key={lesson.id}
              id={lesson.id}
              title={lesson.title}
              category={lesson.category}
              state="prerequisite_locked"
              onClick={onSelectLesson}
              index={idx}
            />
          );
        }

        // 2. If prerequisites ARE met, check the Guest Wall
        if (isLockedByWall) {
          return (
            <LockedNode
              key={lesson.id}
              id={lesson.id}
              title={lesson.title}
              category={lesson.category}
              index={idx}
            />
          );
        }

        // 3. Otherwise, return the lesson node as either 'unlocked' or 'completed'
        return (
          <LessonNode
            key={lesson.id}
            id={lesson.id}
            title={lesson.title}
            category={lesson.category}
            state={state}
            onClick={onSelectLesson}
            index={idx}
          />
        );
      })}
    </div>
  );
};
