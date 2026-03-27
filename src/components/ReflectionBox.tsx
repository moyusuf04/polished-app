import { useState } from 'react';
import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';
import { motion } from 'framer-motion';

// Strictly limit input text length to prevent DB bloating or extreme payloads
const reflectionSchema = z.string()
  .trim()
  .min(50, 'Provide at least 50 characters of depth.')
  .max(1000, 'Keep it concise: Max 1000 characters.');

interface Props {
  lessonId: string;
  prompt: string;
  onSuccess: (sanitizedText: string) => void;
  initialValue?: string;
  isRevealed?: boolean;
}

export function ReflectionBox({ lessonId, prompt, onSuccess, initialValue = '', isRevealed = false }: Props) {
  const [text, setText] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const minLength = 50;
  const maxLength = 1000;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim().length < minLength) return;
    
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
    
    setIsSubmitting(false);
    onSuccess(sanitizedText);
  };

  const progress = (text.length / minLength) * 100;
  const isMet = text.length >= minLength;

  return (
    <div className="w-full max-w-2xl mx-auto px-6 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="p-8 bg-[#0d0d10] border border-white/10 relative overflow-hidden shadow-2xl rounded-sm">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        <h3 className="text-[10px] tracking-[0.2em] uppercase text-white/30 font-medium mb-4">Critical Reflection</h3>
        <p className="font-serif text-2xl text-white/90 mb-8 leading-snug">
          {prompt}
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="relative mb-6">
            <textarea
              value={text}
              disabled={isRevealed}
              onChange={(e) => {
                setText(e.target.value);
                if (error) setError(null);
              }}
              placeholder="I think that..."
              className={`w-full bg-white/[0.03] border rounded-sm p-6 text-white placeholder-white/10 focus:outline-none focus:border-white/30 focus:bg-white/[0.05] transition-all resize-none min-h-[160px] font-sans font-light leading-relaxed ${error ? 'border-rose-900/50' : 'border-white/10'} ${isRevealed ? 'opacity-50 cursor-default' : ''}`}
            />
            
            <div className="absolute bottom-4 right-6 flex items-center gap-4">
              <span className={`text-[10px] font-mono tracking-widest font-bold transition-all ${isMet ? 'text-[#52B788]' : 'text-white/20'}`}>
                {text.length} <span className="opacity-20">/ min {minLength}</span>
              </span>
            </div>
          </div>

          {!isRevealed && (
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex-1 w-full sm:w-auto">
                 <div className="flex justify-between mb-2">
                   <span className="text-[9px] tracking-widest text-white/20 uppercase">Reflection Depth</span>
                   <span className="text-[9px] tracking-widest text-[#52B788] uppercase">{Math.min(Math.round(progress), 100)}%</span>
                 </div>
                 <div className="h-0.5 w-full bg-white/5 overflow-hidden rounded-full">
                    <div 
                      className={`h-full transition-all duration-300 ${isMet ? 'bg-[#52B788]' : 'bg-white/10'}`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                 </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !isMet}
                className="w-full sm:w-auto bg-white text-black px-12 py-4 text-xs font-bold tracking-[0.2em] uppercase rounded-sm border-b-4 border-zinc-300 active:translate-y-px active:border-b-0 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed transition-all shadow-xl shadow-white/5 relative overflow-hidden group"
              >
                <span className="relative z-10">{isSubmitting ? 'Syncing...' : 'Submit Reflection'}</span>
                
                {isMet && !isSubmitting && (
                  <motion.div 
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear", repeatDelay: 1 }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 z-0"
                  />
                )}
              </button>
            </div>
          )}
          
          {error && <p className="mt-4 text-[10px] tracking-widest text-rose-500 uppercase font-bold">{error}</p>}
        </form>
      </div>
    </div>
  );
}

