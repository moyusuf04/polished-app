'use client';

import { useState, useEffect } from 'react';
import { ReflectionBox } from '@/components/ReflectionBox';
import { DiscussionFeed } from '@/components/DiscussionFeed';
import { useGuestAuth } from '@/hooks/useGuestAuth';
import { createClient } from '@/lib/supabase/client';
import { Sparkles, ArrowRight, Home, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface Props {
  lessonId: string;
  prompt: string;
  onDone?: () => void;
}

export function LessonClient({ lessonId, prompt, onDone }: Props) {
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showPeers, setShowPeers] = useState(false);
  const [reflections, setReflections] = useState<any[]>([]);
  const [isLoadingReflections, setIsLoadingReflections] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);
  
  const { status, guestId, incrementLessons, isSignupRequired } = useGuestAuth();
  const supabase = createClient();

  // Handle the transition from content to "The Room"
  const handleSuccess = async (sanitizedText: string) => {
    setIsSaving(true);
    setError(null);
    
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;

      // If no session exists (rare fallback), we still let them proceed locally
      if (!session) {
        incrementLessons();
        setHasSubmitted(true);
        return;
      }

      const userId = session.user.id;

      // 1. Mark lesson as completed in the database
      const { error: pErr } = await supabase
        .from('user_progress')
        .upsert([{ user_id: userId, lesson_id: lessonId }], { onConflict: 'user_id,lesson_id' });
        
      if (pErr) console.warn('Progress sync warning:', pErr.message);

      // 2. Commit the unique reflection "Take" to the newly created table
      const { error: rErr } = await supabase
        .from('reflections')
        .insert([{ 
          user_id: userId, 
          lesson_id: lessonId, 
          response_text: sanitizedText 
        }]);

      if (rErr) {
        console.error('Reflection protocol failure:', rErr);
        throw rErr;
      }

      // Success: trigger UI transition
      setHasSubmitted(true);
    } catch (err: any) {
      console.error('Critical sync failure:', err);
      setError({
        message: err.message || 'Database synchronization failed.',
        code: err.code
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Fetch real peer insights when entering "The Room"
  useEffect(() => {
    if (showPeers) {
      async function fetchReflections() {
        setIsLoadingReflections(true);
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          const { data, error: fErr } = await supabase
            .from('reflections')
            .select('id, response_text, created_at, user_id')
            .eq('lesson_id', lessonId)
            .order('created_at', { ascending: false })
            .limit(10);
          
          if (fErr) throw fErr;

          if (data) {
            const mappedReflections = data.map(r => ({
              ...r,
              is_current_user: session?.user.id === r.user_id
            }));
            setReflections(mappedReflections);
          }
        } catch (err) {
          console.error('Failed to retrieve community takes:', err);
        } finally {
          setIsLoadingReflections(false);
        }
      }
      fetchReflections();
    }
  }, [showPeers, lessonId, supabase]);

  return (
    <div className="flex flex-col items-center w-full">
      {!hasSubmitted ? (
        <div className="w-full flex flex-col items-center">
          <ReflectionBox lessonId={lessonId} prompt={prompt} onSuccess={handleSuccess} />
          {error && (
            <div className="mt-8 p-6 bg-rose-500/5 border border-rose-500/20 rounded-sm max-w-xl w-full animate-in slide-in-from-top-4">
               <div className="flex items-start gap-4">
                 <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                 <div>
                   <p className="text-[10px] tracking-[0.2em] text-rose-500 uppercase font-black mb-1">System Error</p>
                   <p className="text-white/60 text-sm font-sans">{error.message}</p>
                   {error.code && <span className="text-[9px] font-mono text-white/10 uppercase tracking-widest mt-2 block">ID: {error.code}</span>}
                 </div>
               </div>
            </div>
          )}
        </div>
      ) : !showPeers ? (
        <div className="w-full max-w-xl mx-auto px-6 mb-24 animate-in fade-in zoom-in-95 duration-700 flex flex-col items-center py-20 bg-[#0d0d10] border border-white/5 rounded-sm relative shadow-2xl">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#52B788] to-transparent" />
          
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-8 border border-[#52B788]/20 shadow-[0_0_30px_rgba(82,183,136,0.1)]">
             <Sparkles className="w-8 h-8 text-[#52B788]" />
          </div>
          
          <h3 className="text-3xl font-serif text-white mb-3 tracking-tight">Perspective Logged.</h3>
          
          <div className="mb-12" />

          <button 
            onClick={() => setShowPeers(true)}
            className="w-full py-5 bg-white text-black text-xs font-bold tracking-[0.25em] uppercase rounded-sm border-b-4 border-zinc-300 active:translate-y-px active:border-b-0 hover:brightness-95 transition-all shadow-xl shadow-white/5 flex items-center justify-center gap-4"
          >
            Enter The Room
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center">
          <DiscussionFeed reflections={reflections} isLoading={isLoadingReflections} />
          
          <div className="mt-8 mb-24 animate-in fade-in duration-1000 slide-in-from-bottom-4">
             <button 
               onClick={() => {
                 incrementLessons();
                 onDone?.();
               }}
               className="px-12 py-5 bg-white/5 border border-white/10 hover:border-white/30 text-white text-[10px] font-bold tracking-[0.3em] uppercase rounded-sm transition-all flex items-center gap-4 group"
             >
               <Home className="w-4 h-4 text-[#52B788] group-hover:scale-110 transition-transform" />
               Complete Session & Return
             </button>
          </div>
        </div>
      )}

      {/* Guest Conversion Modal Overlay */}
      {isSignupRequired && (status === 'anonymous' || status === 'local') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/98 px-6 animate-in fade-in duration-500">
           <div className="w-full max-w-md p-10 bg-[#0d0d10] border border-white/5 rounded-sm shadow-2xl text-center flex flex-col items-center relative">
             <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4A017] to-transparent" />
             
             <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-8 border-b-4 border-zinc-300">
                <Sparkles className="w-7 h-7 text-black" />
             </div>
             
             <h2 className="text-3xl font-serif text-white mb-4 tracking-tight">You've had a taste!</h2>
             <p className="text-white/30 mb-12 leading-relaxed text-[11px] tracking-widest uppercase font-bold">
               Create a free account to keep going and save everything you have learned.
             </p>
             
             <div className="w-full space-y-6">
               <Link 
                 href={guestId ? `/signup?origin_guest_id=${guestId}` : "/signup"}
                 className="block w-full py-5 bg-white text-black text-[11px] font-bold tracking-[0.25em] uppercase rounded-sm border-b-4 border-zinc-300 active:translate-y-px active:border-b-0 transition-all shadow-xl shadow-white/5"
               >
                 Create account
               </Link>
               <button 
                 onClick={onDone}
                 className="block w-full py-4 text-white/20 hover:text-white transition-all text-[10px] font-bold tracking-[0.3em] uppercase"
               >
                 Back to Hub
               </button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
}
