'use client';

import { Plus, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import type { SlideData } from '@/lib/validators/lesson';

interface Props {
  slides: SlideData[];
  onChange: (slides: SlideData[]) => void;
}

const SLIDE_TYPES: SlideData['type'][] = ['context', 'insight', 'significance', 'custom'];

export function SlideEditor({ slides, onChange }: Props) {
  const addSlide = () => {
    onChange([...slides, { type: 'custom', text: '' }]);
  };

  const removeSlide = (index: number) => {
    onChange(slides.filter((_, i) => i !== index));
  };

  const updateSlide = (index: number, field: keyof SlideData, value: string) => {
    const updated = slides.map((s, i) => i === index ? { ...s, [field]: value } : s);
    onChange(updated);
  };

  const moveSlide = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= slides.length) return;
    const updated = [...slides];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <label className="text-[10px] tracking-[0.2em] font-bold text-white/30 uppercase">Curated Content Slides</label>
        <button 
          type="button" 
          onClick={addSlide} 
          className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-[#52B788] hover:text-white transition-all uppercase"
        >
          <Plus className="w-3 h-3" />
          Add Slide
        </button>
      </div>

      {slides.length === 0 && (
        <div className="py-12 border border-white/5 border-dashed flex items-center justify-center">
          <p className="text-white/10 text-[10px] tracking-[0.2em] uppercase font-bold text-center">
            No slides defined.<br/>Initialize lesson content above.
          </p>
        </div>
      )}

      {slides.map((slide, i) => (
        <div key={i} className="bg-[#0d0d10] border border-white/5 shadow-2xl p-6 space-y-5 relative group overflow-hidden rounded-sm transition-colors hover:border-white/10">
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-white/10 font-mono tracking-widest">{String(i + 1).padStart(2, '0')}</span>
            <select
              value={slide.type}
              onChange={e => updateSlide(i, 'type', e.target.value)}
              className="bg-white/5 border border-white/10 text-white text-[10px] tracking-[0.15em] font-bold uppercase rounded-sm px-4 py-2 outline-none focus:border-white/30 transition-all appearance-none cursor-pointer pr-8"
            >
              {SLIDE_TYPES.map(t => <option key={t} value={t} className="bg-[#0d0d10] text-white">{t}</option>)}
            </select>
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <button 
                type="button" 
                onClick={() => moveSlide(i, -1)} 
                disabled={i === 0} 
                className="p-2 text-white/20 hover:text-white disabled:opacity-5 transition-colors"
                title="Move Up"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button 
                type="button" 
                onClick={() => moveSlide(i, 1)} 
                disabled={i === slides.length - 1} 
                className="p-2 text-white/20 hover:text-white disabled:opacity-5 transition-colors"
                title="Move Down"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button 
                type="button" 
                onClick={() => removeSlide(i)} 
                className="p-2 text-rose-900/40 hover:text-rose-500 transition-colors ml-2"
                title="Delete Slide"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          {slide.type === 'custom' && (
            <input
              type="text"
              value={slide.title || ''}
              onChange={e => updateSlide(i, 'title', e.target.value)}
              placeholder="Custom Label (e.g. Pro Tip)"
              className="w-full bg-white/[0.03] border border-white/5 text-white rounded-sm px-5 py-3 text-[11px] font-bold tracking-widest uppercase outline-none focus:border-white/20 transition-all mb-2"
            />
          )}
          <textarea
            value={slide.text}
            onChange={e => updateSlide(i, 'text', e.target.value)}
            placeholder="Slide content..."
            className="w-full bg-white/[0.03] border border-white/5 text-white rounded-sm px-5 py-4 text-base font-sans font-light leading-relaxed outline-none focus:border-white/20 transition-all resize-none min-h-[100px]"
          />
          <div className="flex justify-between items-center px-1">
             <div className="h-[1px] flex-1 bg-white/5 mr-4" />
             <p className="text-[9px] text-white/10 tracking-widest uppercase font-mono">{slide.text.length} characters</p>
          </div>
        </div>
      ))}
    </div>
  );
}
