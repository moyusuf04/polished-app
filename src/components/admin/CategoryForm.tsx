'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { categoryCreateSchema, type CategoryCreateInput } from '@/lib/validators/category';
import { MINERALS } from '@/lib/design-tokens';

const PRESET_COLORS = Object.values(MINERALS).map(m => m.light);

interface Props {
  initial?: { id: string; name: string; description: string; theme_color: string };
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
}

export function CategoryForm({ initial, onSubmit, onCancel }: Props) {
  const [selectedColor, setSelectedColor] = useState(initial?.theme_color ?? PRESET_COLORS[0]);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CategoryCreateInput>({
    resolver: zodResolver(categoryCreateSchema),
    defaultValues: {
      name: initial?.name ?? '',
      description: initial?.description ?? '',
      theme_color: initial?.theme_color ?? PRESET_COLORS[0],
    },
  });

  const onFormSubmit = async (data: CategoryCreateInput) => {
    const fd = new FormData();
    fd.set('name', data.name);
    fd.set('description', data.description ?? '');
    fd.set('theme_color', selectedColor);
    if (initial?.id) fd.set('id', initial.id);
    await onSubmit(fd);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8 max-w-2xl px-8 py-10 bg-[#0d0d10] border border-white/5 shadow-2xl relative overflow-hidden rounded-sm">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <div>
        <label className="block text-[10px] tracking-[0.2em] font-bold text-white/30 uppercase mb-3">Classification Name</label>
        <input
          {...register('name')}
          className="w-full bg-white/[0.03] border border-white/10 text-white rounded-sm px-5 py-4 outline-none focus:border-white/30 transition-all font-sans font-light tracking-wide"
          placeholder="e.g. Executive Presence"
        />
        {errors.name && <p className="text-rose-500 text-[10px] tracking-widest uppercase font-medium mt-2">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-[10px] tracking-[0.2em] font-bold text-white/30 uppercase mb-3">Institutional Description</label>
        <textarea
          {...register('description')}
          className="w-full bg-white/[0.03] border border-white/10 text-white rounded-sm px-5 py-4 outline-none focus:border-white/30 transition-all resize-none min-h-[120px] font-sans font-light leading-relaxed"
          placeholder="Define the scope of this cultural track..."
        />
        {errors.description && <p className="text-rose-500 text-[10px] tracking-widest uppercase font-medium mt-2">{errors.description.message}</p>}
      </div>

      <div>
        <label className="block text-[10px] tracking-[0.2em] font-bold text-white/30 uppercase mb-4">Mineral Signature</label>
        <div className="flex flex-wrap gap-4">
          {PRESET_COLORS.map(color => (
            <button
              key={color}
              type="button"
              onClick={() => setSelectedColor(color)}
              className={`w-10 h-10 rounded-full transition-all relative group flex items-center justify-center`}
              style={{ backgroundColor: color }}
            >
              <div className={`absolute -inset-1.5 border border-white/20 rounded-full scale-110 transition-opacity ${selectedColor === color ? 'opacity-100' : 'opacity-0'}`} />
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 rounded-full transition-opacity" />
            </button>
          ))}
        </div>
        <input type="hidden" {...register('theme_color')} value={selectedColor} />
      </div>

      <div className="flex flex-col sm:flex-row gap-6 pt-6 border-t border-white/5">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 py-4 bg-white text-black text-xs font-bold tracking-[0.2em] uppercase rounded-sm border-b-4 border-zinc-300 active:translate-y-px active:border-b-0 hover:brightness-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Syncing...' : initial ? 'Commit Changes' : 'Initialize Category'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-8 py-4 text-[10px] font-bold tracking-[0.2em] uppercase text-white/20 hover:text-white transition-all"
        >
          Discard
        </button>
      </div>
    </form>
  );
}
