'use client';

import { useState, useEffect, useTransition } from 'react';
import { CategoryForm } from '@/components/admin/CategoryForm';
import { getCategories, createCategory, updateCategory, softDeleteCategory, restoreCategory } from '@/actions/category-actions';
import { Plus, Tag, Trash2, RotateCcw, Edit3, X, Info } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description: string;
  theme_color: string;
  deleted_at: string | null;
  created_at: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadCategories = async () => {
    const result = await getCategories(showDeleted);
    if (result.success) {
      setCategories(result.data as Category[]);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [showDeleted]);

  const handleCreate = async (formData: FormData) => {
    setError(null);
    const result = await createCategory(formData);
    if (result.success) {
      setShowForm(false);
      await loadCategories();
    } else {
      setError(result.error ?? 'Failed to create category');
    }
  };

  const handleUpdate = async (formData: FormData) => {
    setError(null);
    const result = await updateCategory(formData);
    if (result.success) {
      setEditingCategory(null);
      await loadCategories();
    } else {
      setError(result.error ?? 'Failed to update category');
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    startTransition(async () => {
      const result = await softDeleteCategory(id);
      if (result.success) {
        await loadCategories();
      } else {
        setError(result.error ?? 'Failed to delete category');
      }
    });
  };

  const handleRestore = async (id: string) => {
    setError(null);
    startTransition(async () => {
      const result = await restoreCategory(id);
      if (result.success) {
        await loadCategories();
      } else {
        setError(result.error ?? 'Failed to restore category');
      }
    });
  };

  return (
    <div className="animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
           <div className="flex items-center gap-3 mb-2">
             <h1 className="text-4xl font-serif text-white tracking-tight">Taxonomies</h1>
             <span className="bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-mono text-white/40 rounded-sm">{categories.length}</span>
           </div>
          <p className="text-white/30 text-xs tracking-widest uppercase font-medium font-outfit">Domain Classification & Styling</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setShowDeleted(!showDeleted)}
            className={`px-6 py-3 text-[10px] font-bold tracking-widest uppercase rounded-sm border transition-all ${
              showDeleted 
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' 
                : 'bg-white/[0.03] border-white/5 text-white/20 hover:text-white/40 hover:border-white/10'
            }`}
          >
            {showDeleted ? 'Hide Archived' : 'Show Archived'}
          </button>
          <button
            onClick={() => { setShowForm(true); setEditingCategory(null); }}
            className="flex items-center gap-3 px-8 py-3 bg-white text-black text-[10px] font-bold tracking-[0.2em] uppercase rounded-sm border-b-4 border-zinc-300 active:translate-y-px active:border-b-0 hover:brightness-95 transition-all shadow-xl shadow-white/5"
          >
            <Plus className="w-4 h-4" />
            New Category
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-5 bg-rose-500/5 border border-rose-500/20 text-rose-500 text-[10px] tracking-widest uppercase font-bold flex items-center gap-3 animate-in slide-in-from-top-2">
           <Info className="w-4 h-4" />
           {error}
        </div>
      )}

      {/* Form Overlay/Modal */}
      {(showForm || editingCategory) && (
        <div className="mb-12 animate-in fade-in zoom-in-95 duration-500">
          <div className="flex items-center justify-between mb-6">
             <h2 className="text-[11px] font-bold text-white/20 uppercase tracking-[0.3em] flex items-center gap-3">
               <Tag className="w-4 h-4 text-[#52B788]" />
               {editingCategory ? 'Modify Entity' : 'Institutional Registry'}
             </h2>
             <button onClick={() => { setShowForm(false); setEditingCategory(null); }} className="p-2 text-white/20 hover:text-white transition-colors">
               <X className="w-5 h-5" />
             </button>
          </div>
          <CategoryForm
            initial={editingCategory ? { id: editingCategory.id, name: editingCategory.name, description: editingCategory.description ?? '', theme_color: editingCategory.theme_color } : undefined}
            onSubmit={editingCategory ? handleUpdate : handleCreate}
            onCancel={() => { setShowForm(false); setEditingCategory(null); }}
          />
        </div>
      )}

      {/* Registry Table */}
      <div className="bg-[#0d0d10] border border-white/5 shadow-2xl relative overflow-hidden rounded-sm">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.01]">
              <th className="text-[10px] text-white/20 uppercase tracking-[0.2em] px-8 py-5 font-bold">Mineral</th>
              <th className="text-[10px] text-white/20 uppercase tracking-[0.2em] px-8 py-5 font-bold">Domain</th>
              <th className="text-[10px] text-white/20 uppercase tracking-[0.2em] px-8 py-5 font-bold">Description</th>
              <th className="text-[10px] text-white/20 uppercase tracking-[0.2em] px-8 py-5 font-bold">State</th>
              <th className="text-[10px] text-white/20 uppercase tracking-[0.2em] px-8 py-5 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {categories.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center">
                   <p className="text-white/10 text-[10px] tracking-[0.3em] uppercase font-bold">Taxonomy record empty</p>
                </td>
              </tr>
            ) : (
              categories.map(cat => (
                <tr key={cat.id} className={`group hover:bg-white/[0.02] transition-colors ${cat.deleted_at ? 'opacity-30' : ''}`}>
                  <td className="px-8 py-6">
                    <div className="w-8 h-8 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.05)] border border-white/10 flex items-center justify-center overflow-hidden">
                       <div className="w-full h-full opacity-60" style={{ backgroundColor: cat.theme_color }} />
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-white font-serif tracking-tight text-lg leading-none">{cat.name}</p>
                    <p className="text-[9px] text-white/10 font-mono tracking-widest mt-2 uppercase">{cat.id.slice(0, 8)}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-white/40 text-xs tracking-wide font-light line-clamp-1 max-w-sm">{cat.description || '—'}</p>
                  </td>
                  <td className="px-8 py-6">
                    {cat.deleted_at ? (
                      <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-rose-500/60 flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-rose-500/40" />
                        Archived
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-[#52B788] flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-[#52B788]" />
                        Online
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex gap-4 justify-end items-center opacity-20 group-hover:opacity-100 transition-opacity">
                      {cat.deleted_at ? (
                        <button 
                          onClick={() => handleRestore(cat.id)} 
                          disabled={isPending} 
                          className="p-2 text-white/40 hover:text-[#4A90D9] transition-colors"
                          title="Restore"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      ) : (
                        <>
                          <button 
                            onClick={() => setEditingCategory(cat)} 
                            className="p-2 text-white/40 hover:text-white transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(cat.id)} 
                            disabled={isPending} 
                            className="p-2 text-white/40 hover:text-rose-500 transition-colors"
                            title="Archive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
