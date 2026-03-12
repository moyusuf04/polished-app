'use client';

import { useState, useEffect, useTransition } from 'react';
import { getLessons, softDeleteLesson, restoreLesson, publishLesson } from '@/actions/lesson-actions';
import { getCategories } from '@/actions/category-actions';
import { Plus, Search, Filter, Eye, Trash2, RotateCcw, CheckCircle, Edit3, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Lesson {
  id: string;
  title: string;
  category_id: string;
  difficulty: string;
  status: string;
  deleted_at: string | null;
  position: number;
}

interface Category { id: string; name: string; theme_color: string; }

export default function LessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadLessons = async () => {
    const result = await getLessons({
      search: search || undefined,
      category_id: filterCategory || undefined,
      status: filterStatus || undefined,
      page,
      includeDeleted: showDeleted,
    });
    if (result.success) {
      const d = result.data as { lessons: Lesson[]; total: number };
      setLessons(d.lessons ?? []);
      setTotal(d.total ?? 0);
    }
  };

  const loadCategories = async () => {
    const result = await getCategories();
    if (result.success) setCategories(result.data as Category[]);
  };

  useEffect(() => { loadCategories(); }, []);
  useEffect(() => { loadLessons(); }, [page, search, filterCategory, filterStatus, showDeleted]);

  const getCategoryName = (catId: string) => categories.find(c => c.id === catId)?.name ?? '—';

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const r = await softDeleteLesson(id);
      if (r.success) await loadLessons(); else setError(r.error ?? 'Failed');
    });
  };

  const handleRestore = (id: string) => {
    startTransition(async () => {
      const r = await restoreLesson(id);
      if (r.success) await loadLessons(); else setError(r.error ?? 'Failed');
    });
  };

  const handlePublish = (id: string) => {
    startTransition(async () => {
      const r = await publishLesson(id);
      if (r.success) await loadLessons(); else setError(r.error ?? 'Failed');
    });
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
           <div className="flex items-center gap-3 mb-2">
             <h1 className="text-4xl font-serif text-white tracking-tight">Lessons</h1>
             <span className="bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-mono text-white/40 rounded-sm">{total}</span>
           </div>
          <p className="text-white/30 text-xs tracking-widest uppercase font-medium">Knowledge Inventory & Access Control</p>
        </div>
        <Link
          href="/admin/lessons/new"
          className="flex items-center gap-3 px-8 py-3 bg-white text-black text-[10px] font-bold tracking-[0.2em] uppercase rounded-sm border-b-4 border-zinc-300 active:translate-y-px active:border-b-0 hover:brightness-95 transition-all shadow-xl shadow-white/5"
        >
          <Plus className="w-4 h-4" />
          Initialize Lesson
        </Link>
      </div>

      {error && (
        <div className="mb-8 p-5 bg-rose-500/5 border border-rose-500/20 text-rose-500 text-[10px] tracking-widest uppercase font-bold flex items-center gap-3 animate-in slide-in-from-top-2">
           <Info className="w-4 h-4" />
           {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        <div className="relative flex-1 min-w-[300px] group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within:text-white/40 transition-colors" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search catalog..."
            className="w-full bg-white/[0.03] border border-white/5 text-white rounded-sm pl-12 pr-6 py-3 text-[11px] font-bold tracking-widest uppercase outline-none focus:border-white/20 transition-all"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={filterCategory}
            onChange={e => { setFilterCategory(e.target.value); setPage(1); }}
            className="bg-[#0d0d10] border border-white/5 text-white/40 text-[10px] tracking-[0.15em] font-bold uppercase rounded-sm px-4 py-3 outline-none focus:border-white/20 transition-all appearance-none cursor-pointer pr-10"
          >
            <option value="">All Regions</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          
          <select
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
            className="bg-[#0d0d10] border border-white/5 text-white/40 text-[10px] tracking-[0.15em] font-bold uppercase rounded-sm px-4 py-3 outline-none focus:border-white/20 transition-all appearance-none cursor-pointer pr-10"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>

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
        </div>
      </div>

      {/* Table - Reimagined as "Ledger" */}
      <div className="bg-[#0d0d10] border border-white/5 shadow-2xl relative overflow-hidden rounded-sm">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.01]">
              <th className="text-[10px] text-white/20 uppercase tracking-[0.2em] px-8 py-5 font-bold">Node Title</th>
              <th className="text-[10px] text-white/20 uppercase tracking-[0.2em] px-8 py-5 font-bold">Classification</th>
              <th className="text-[10px] text-white/20 uppercase tracking-[0.2em] px-8 py-5 font-bold">Tier</th>
              <th className="text-[10px] text-white/20 uppercase tracking-[0.2em] px-12 py-5 font-bold">State</th>
              <th className="text-[10px] text-white/20 uppercase tracking-[0.2em] px-8 py-5 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {lessons.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center">
                  <p className="text-white/10 text-[10px] tracking-[0.3em] uppercase font-bold">No records found in current catalog</p>
                </td>
              </tr>
            ) : lessons.map(lesson => (
              <tr key={lesson.id} className={`group hover:bg-white/[0.02] transition-colors ${lesson.deleted_at ? 'opacity-30' : ''}`}>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                     <div className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-[#52B788] transition-colors shadow-[0_0_8px_rgba(82,183,136,0)] group-hover:shadow-[0_0_8px_rgba(82,183,136,0.5)]" />
                     <p className="text-white font-serif tracking-tight text-lg">{lesson.title}</p>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="text-[10px] text-white/30 tracking-[0.15em] font-bold uppercase">{getCategoryName(lesson.category_id)}</span>
                </td>
                <td className="px-8 py-6 font-mono text-[10px] text-white/20 tracking-widest">
                  {lesson.difficulty ?? '—'}
                </td>
                <td className="px-12 py-6">
                  <div className="flex items-center gap-2">
                    <div className={`w-1 h-1 rounded-full ${lesson.status === 'published' ? 'bg-[#52B788]' : 'bg-[#D4A017]'}`} />
                    <span className={`text-[9px] font-bold tracking-[0.2em] uppercase ${
                      lesson.status === 'published' ? 'text-[#52B788]' : 'text-[#D4A017]'
                    }`}>
                      {lesson.status}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex gap-4 justify-end items-center opacity-20 group-hover:opacity-100 transition-opacity">
                    {lesson.deleted_at ? (
                      <button 
                        onClick={() => handleRestore(lesson.id)} 
                        disabled={isPending} 
                        className="p-2 text-white/40 hover:text-[#4A90D9] transition-colors"
                        title="Restore"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    ) : (
                      <>
                        <Link 
                          href={`/admin/lessons/${lesson.id}`} 
                          className="p-2 text-white/40 hover:text-white transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        {lesson.status === 'draft' && (
                          <button 
                            onClick={() => handlePublish(lesson.id)} 
                            disabled={isPending} 
                            className="p-2 text-white/40 hover:text-[#52B788] transition-colors"
                            title="Publish"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(lesson.id)} 
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
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-8 mt-12 bg-[#0d0d10] border border-white/5 p-4 rounded-sm shadow-2xl">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 text-white/20 hover:text-white disabled:opacity-5 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-4">
             <span className="text-[10px] text-white/10 tracking-[0.3em] font-bold uppercase">Volume</span>
             <span className="text-xs font-mono text-white/60 tracking-widest">{page} / {totalPages}</span>
          </div>

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 text-white/20 hover:text-white disabled:opacity-5 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}

const Info = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
