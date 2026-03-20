'use client';

import { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Props {
  lessonId: string;
  userId: string;
}

export function SaveButton({ lessonId, userId }: Props) {
  const [isSaved, setIsSaved] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function checkSavedStatus() {
      if (!userId) return;
      const { data, error } = await supabase
        .from('saved_lessons')
        .select('id')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .maybeSingle();
      
      if (data && !error) {
        setIsSaved(true);
      }
    }
    checkSavedStatus();
  }, [lessonId, userId, supabase]);

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId) return;

    const previousState = isSaved;
    setIsSaved(!previousState); // Optimistic update
    setIsPending(true);

    try {
      if (!previousState) {
        // Save
        const { error } = await supabase
          .from('saved_lessons')
          .upsert({ 
            user_id: userId, 
            lesson_id: lessonId, 
            created_at: new Date().toISOString() 
          }, { onConflict: 'user_id,lesson_id' });
        
        if (error) throw error;
        // Toast logic (assuming a simple alert or if I can find a toast utility)
        // User said: "On successful save, show a toast: 'Saved to your Intellectual Vault.'"
        // I'll check for a toast library.
      } else {
        // Unsave
        const { error } = await supabase
          .from('saved_lessons')
          .delete()
          .eq('user_id', userId)
          .eq('lesson_id', lessonId);
        
        if (error) throw error;
      }
    } catch (err) {
      console.error('Failed to toggle save:', err);
      setIsSaved(previousState); // Revert
      alert("Could not save. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button
      onClick={handleToggleSave}
      disabled={isPending}
      className={`p-3 rounded-full transition-all duration-300 backdrop-blur-md border ${
        isSaved 
          ? 'bg-white text-black border-white shadow-lg' 
          : 'bg-black/20 text-white/30 border-white/5 hover:text-white hover:bg-white/5'
      }`}
      title={isSaved ? "Remove from Vault" : "Save to Intellectual Vault"}
    >
      <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
    </button>
  );
}
