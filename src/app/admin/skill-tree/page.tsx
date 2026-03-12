'use client';

import { useState, useEffect } from 'react';
import { SkillTreeEditor } from '@/components/admin/SkillTreeEditor';
import { getSkillTree } from '@/actions/skilltree-actions';
import { getCategories } from '@/actions/category-actions';
import type { SkillTreeNode, SkillTreeEdge } from '@/actions/skilltree-actions';

interface Category { id: string; name: string; theme_color: string; }

export default function SkillTreePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [nodes, setNodes] = useState<SkillTreeNode[]>([]);
  const [edges, setEdges] = useState<SkillTreeEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const catResult = await getCategories();
      if (catResult.success) {
        const cats = catResult.data as Category[];
        setCategories(cats);
        if (cats.length > 0) setActiveCategory(cats[0].id);
      }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!activeCategory) return;
    setLoading(true);
    (async () => {
      const result = await getSkillTree(activeCategory);
      if (result.success) {
        const d = result.data as { nodes: SkillTreeNode[]; edges: SkillTreeEdge[] };
        setNodes(d.nodes);
        setEdges(d.edges);
      }
      setLoading(false);
    })();
  }, [activeCategory]);

  return (
    <div>
      <h1 className="text-3xl font-serif text-white mb-2">Skill Tree Editor</h1>
      <p className="text-zinc-500 mb-8">Visually manage lesson prerequisites.</p>

      {/* Category tabs */}
      <div className="flex gap-2 mb-6">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`rounded-full px-5 py-2 font-medium text-sm shrink-0 transition-colors ${
              activeCategory === cat.id
                ? 'bg-white text-black'
                : 'bg-transparent text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: cat.theme_color }} />
            {cat.name}
          </button>
        ))}
      </div>

      {error && <div className="mb-4 p-4 bg-red-950/50 border border-red-900 rounded-xl text-red-400 text-sm">{error}</div>}
      {success && <div className="mb-4 p-4 bg-emerald-950/50 border border-emerald-900 rounded-xl text-emerald-400 text-sm">{success}</div>}

      {loading ? (
        <div className="h-[600px] bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center">
          <div className="animate-pulse space-y-4 text-center">
            <div className="w-12 h-12 bg-zinc-800 rounded-full mx-auto" />
            <p className="text-zinc-600 text-sm">Loading skill tree...</p>
          </div>
        </div>
      ) : nodes.length === 0 ? (
        <div className="h-[400px] bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center">
          <p className="text-zinc-600 text-sm">No lessons in this category yet. Create some in the Lessons tab first.</p>
        </div>
      ) : (
        <SkillTreeEditor
          initialNodes={nodes}
          initialEdges={edges}
          onError={msg => { setError(msg); setSuccess(null); setTimeout(() => setError(null), 5000); }}
          onSuccess={msg => { setSuccess(msg); setError(null); setTimeout(() => setSuccess(null), 3000); }}
        />
      )}
    </div>
  );
}
