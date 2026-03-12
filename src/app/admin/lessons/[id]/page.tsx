'use client';

import { useState, useEffect, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SlideEditor } from '@/components/admin/SlideEditor';
import { LessonPreview } from '@/components/admin/LessonPreview';
import { getLesson, createLesson, updateLesson, getLessonVersions, restoreVersion, bulkImportLessons } from '@/actions/lesson-actions';
import { getCategories } from '@/actions/category-actions';
import { generateSlug, parseBulkImport } from '@/lib/validators/lesson';
import type { SlideData } from '@/lib/validators/lesson';

interface Category { id: string; name: string; }

interface VersionItem {
  id: string;
  snapshot: Record<string, unknown>;
  created_at: string;
}

export default function LessonEditorPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.id as string;
  const isNew = lessonId === 'new';

  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [difficulty, setDifficulty] = useState('Level 1: Foundation');
  const [description, setDescription] = useState('');
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [reflectionPrompt, setReflectionPrompt] = useState('');
  const [convoHooks, setConvoHooks] = useState<string[]>(['']);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [duration, setDuration] = useState('');
  const [format, setFormat] = useState('');
  const [xpReward, setXpReward] = useState<number>(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [versions, setVersions] = useState<VersionItem[]>([]);
  const [showVersions, setShowVersions] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    (async () => {
      const catResult = await getCategories();
      if (catResult.success) setCategories(catResult.data as Category[]);

      if (!isNew) {
        const lessonResult = await getLesson(lessonId);
        if (lessonResult.success) {
          const l = lessonResult.data as Record<string, unknown>;
          setTitle(l.title as string ?? '');
          setCategoryId(l.category_id as string ?? '');
          setDifficulty(l.difficulty as string ?? 'Level 1: Foundation');
          setDescription(l.description as string ?? '');
          setSlides((l.content_slides as SlideData[]) ?? []);
          setReflectionPrompt(l.reflection_prompt as string ?? '');
          setConvoHooks((l.convo_hooks as string[]) ?? ['']);
           setStatus(l.status as 'draft' | 'published');
           setCoverImageUrl(l.cover_image_url as string ?? '');
           setDuration(l.duration as string ?? '');
           setFormat(l.format as string ?? '');
           setXpReward(l.xp_reward as number ?? 0);
         }

        const verResult = await getLessonVersions(lessonId);
        if (verResult.success) setVersions(verResult.data as VersionItem[]);
      }
    })();
  }, [lessonId, isNew]);

  const handleSave = () => {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const input = {
        title,
        category_id: categoryId,
        difficulty,
        description,
        content_slides: slides,
        reflection_prompt: reflectionPrompt,
         convo_hooks: convoHooks.filter(h => h.trim()),
         status,
         cover_image_url: coverImageUrl,
         duration,
         format,
         xp_reward: xpReward,
       };

      const result = isNew ? await createLesson(input) : await updateLesson(lessonId, input);
      if (result.success) {
        setSuccess(isNew ? 'Lesson created!' : 'Lesson saved!');
        if (isNew) {
          const slug = generateSlug(title);
          router.push(`/admin/lessons/${slug}`);
        } else {
          const verResult = await getLessonVersions(lessonId);
          if (verResult.success) setVersions(verResult.data as VersionItem[]);
        }
      } else {
        setError(result.error ?? 'Save failed.');
      }
    });
  };

  const handleRestoreVersion = (versionId: string) => {
    startTransition(async () => {
      const r = await restoreVersion(versionId);
      if (r.success) {
        setSuccess('Version restored. Reloading...');
        window.location.reload();
      } else {
        setError(r.error ?? 'Restore failed.');
      }
    });
  };

  const handleBulkImport = () => {
    const parsed = parseBulkImport(bulkText);
    if (parsed.length > 0) {
      setSlides(prev => [...prev, ...parsed]);
      setBulkText('');
      setShowBulkImport(false);
    } else {
      setError('Could not parse slides from input.');
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        setStatus('published');
        handleSave();
      }
    };
    document.addEventListener('keydown', handler);
     return () => document.removeEventListener('keydown', handler);
   }, [title, categoryId, difficulty, description, slides, reflectionPrompt, convoHooks, status, coverImageUrl, duration, format, xpReward]);

  const updateHook = (index: number, value: string) => {
    setConvoHooks(prev => prev.map((h, i) => i === index ? value : h));
  };

  return (
    <div className="flex gap-8">
      {/* Editor Column */}
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-serif text-white">{isNew ? 'New Lesson' : 'Edit Lesson'}</h1>
          <div className="flex gap-3">
            {!isNew && (
              <button
                onClick={() => setShowVersions(!showVersions)}
                className="px-4 py-2 text-sm text-zinc-400 border border-zinc-800 rounded-xl hover:text-white transition-colors"
              >
                {showVersions ? 'Hide History' : 'View History'}
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={isPending}
              className="px-6 py-2 bg-white text-black font-medium rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50"
            >
              {isPending ? 'Saving...' : 'Save Draft'}
            </button>
          </div>
        </div>

        {error && <div className="p-4 bg-red-950/50 border border-red-900 rounded-xl text-red-400 text-sm">{error}</div>}
        {success && <div className="p-4 bg-emerald-950/50 border border-emerald-900 rounded-xl text-emerald-400 text-sm">{success}</div>}

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-zinc-400 mb-2">Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-zinc-600" placeholder="e.g. Monet's Water Lilies" />
            {title && <p className="text-xs text-zinc-600 mt-1">Slug: {generateSlug(title)}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Category</label>
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-3 outline-none">
              <option value="">Select...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Difficulty</label>
            <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-3 outline-none">
              <option>Level 1: Foundation</option>
              <option>Level 2: Intermediate</option>
              <option>Level 3: Advanced</option>
            </select>
          </div>
           <div className="col-span-2">
             <label className="block text-sm font-medium text-zinc-400 mb-2">Description</label>
             <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-3 outline-none resize-none min-h-[60px]" placeholder="Short description..." />
           </div>
 
           <div>
             <label className="block text-sm font-medium text-zinc-400 mb-2">Duration</label>
             <input value={duration} onChange={e => setDuration(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-3 outline-none" placeholder="e.g. 4 min" />
           </div>
           <div>
             <label className="block text-sm font-medium text-zinc-400 mb-2">Format</label>
             <input value={format} onChange={e => setFormat(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-3 outline-none" placeholder="e.g. Bite-size" />
           </div>
           <div>
             <label className="block text-sm font-medium text-zinc-400 mb-2">Reward XP</label>
             <input type="number" value={xpReward} onChange={e => setXpReward(parseInt(e.target.value) || 0)} className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-3 outline-none" placeholder="e.g. 120" />
           </div>
         </div>

        {/* Slide Editor */}
        <div className="flex items-center justify-between">
          <span />
          <button onClick={() => setShowBulkImport(!showBulkImport)} className="text-sm text-blue-400 hover:text-blue-300">
            {showBulkImport ? 'Close Bulk Import' : 'Bulk Import'}
          </button>
        </div>

        {showBulkImport && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
            <p className="text-xs text-zinc-500">Paste structured text (Context: / Insight: / Significance:)</p>
            <textarea value={bulkText} onChange={e => setBulkText(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-4 py-3 text-sm outline-none resize-none min-h-[100px]" placeholder="Context: In 1872 Claude Monet..." />
            <button onClick={handleBulkImport} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-500">Parse & Add Slides</button>
          </div>
        )}

        <SlideEditor slides={slides} onChange={setSlides} />

        {/* Hooks */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-zinc-400">Conversational Hooks</label>
            <button type="button" onClick={() => setConvoHooks([...convoHooks, ''])} className="text-sm text-blue-400 hover:text-blue-300">+ Add Hook</button>
          </div>
          {convoHooks.map((hook, i) => (
            <div key={i} className="flex gap-2">
              <input value={hook} onChange={e => updateHook(i, e.target.value)} className="flex-1 bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-2 text-sm outline-none" placeholder="Did you know that..." />
              <button onClick={() => setConvoHooks(convoHooks.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-400 text-sm px-2">✕</button>
            </div>
          ))}
        </div>

        {/* Reflection */}
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">Reflection Prompt</label>
          <textarea value={reflectionPrompt} onChange={e => setReflectionPrompt(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-3 outline-none resize-none min-h-[80px]" placeholder="What surprised you about..." />
        </div>

        {/* Version History */}
        {showVersions && versions.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
            <h3 className="text-sm font-medium text-white">Version History</h3>
            {versions.map(v => (
              <div key={v.id} className="flex items-center justify-between py-2 border-b border-zinc-800/50 last:border-0">
                <p className="text-xs text-zinc-400">{new Date(v.created_at).toLocaleString()}</p>
                <button onClick={() => handleRestoreVersion(v.id)} disabled={isPending} className="text-xs text-blue-400 hover:text-blue-300 disabled:opacity-50">Restore</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Column */}
       <div className="w-80 shrink-0 sticky top-8 self-start">
         <LessonPreview 
            title={title} 
            slides={slides} 
            reflectionPrompt={reflectionPrompt} 
            convoHooks={convoHooks.filter(h => h.trim())}
            duration={duration}
            format={format}
            xpReward={xpReward}
         />
       </div>
    </div>
  );
}
