'use client';

import { useState } from 'react';
import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

// Strictly limit input text length to prevent DB bloating or extreme payloads
const reflectionSchema = z.string()
  .trim()
  .min(1, 'Type your take to continue.')
  .max(300, 'Keep it concise: Max 300 characters.');

interface Props {
  lessonId: string;
  prompt: string;
  onSuccess: (sanitizedText: string) => void;
}

export function ReflectionBox({ lessonId, prompt, onSuccess }: Props) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const maxLength = 200;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const validation = reflectionSchema.safeParse(text);
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      setIsSubmitting(false);
      return;
    }
    
    setError(null);
    
    const sanitizedText = DOMPurify.sanitize(validation.data, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    });
    
    if (!sanitizedText || sanitizedText.trim() === '') {
      setError("Input contains invalid or unsafe characters.");
      setIsSubmitting(false);
      return;
    }
    
    setTimeout(() => {
      setIsSubmitting(false);
      onSuccess(sanitizedText);
    }, 500);
  };

  const progress = (text.length / maxLength) * 100;
  const isOver = text.length > maxLength;

  return (
    <div className="w-full max-w-2xl mx-auto px-6 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="p-8 bg-[#0d0d10] border border-white/10 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        <h3 className="text-[10px] tracking-[0.2em] uppercase text-white/30 font-medium mb-4">The Critical Reflection</h3>
        <p className="font-serif text-2xl text-white/90 mb-8 leading-snug">
          {prompt}
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="relative mb-6">
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (error) setError(null);
              }}
              placeholder="I think that..."
              className={`w-full bg-white/[0.03] border rounded-sm p-5 text-white placeholder-white/10 focus:outline-none focus:border-white/30 focus:bg-white/[0.05] transition-all resize-none min-h-[160px] font-sans font-light leading-relaxed ${error ? 'border-rose-900/50' : 'border-white/10'}`}
              maxLength={maxLength + 50} 
            />
            
            <div className="absolute bottom-4 right-4 flex items-center gap-4">
              <span className={`text-[10px] tracking-widest font-medium transition-colors ${isOver ? 'text-rose-500' : 'text-white/20'}`}>
                {text.length}/{maxLength}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex-1 w-full sm:w-auto">
               <div className="flex justify-between mb-2">
                 <span className="text-[9px] tracking-widest text-white/20 uppercase">Reflection Depth</span>
                 <span className="text-[9px] tracking-widest text-[#52B788] uppercase">{Math.min(Math.round(progress), 100)}%</span>
               </div>
               <div className="h-0.5 w-full bg-white/5 overflow-hidden rounded-full">
                  <div 
                    className={`h-full transition-all duration-300 ${isOver ? 'bg-rose-500' : 'bg-[#52B788]'}`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
               </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || text.length === 0 || isOver}
              className="w-full sm:w-auto bg-white text-black px-10 py-3 text-xs font-bold tracking-widest uppercase rounded-sm border-b-4 border-zinc-300 active:translate-y-px active:border-b-0 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? 'Syncing...' : 'Drop Reveal'}
            </button>
          </div>
          
          {error && <p className="mt-4 text-[10px] tracking-widest text-rose-500 uppercase font-medium">{error}</p>}
        </form>
      </div>
    </div>
  );
}
