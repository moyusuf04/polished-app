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
        const isLockedByWall = isSignupRequired && idx >= 3;
        
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

        return (
          <LessonNode
            key={lesson.id}
            id={lesson.id}
            title={lesson.title}
            category={lesson.category}
            state={getNodeState(lesson)}
            onClick={onSelectLesson}
            index={idx}
          />
        );
      })}
    </div>
  );
};
