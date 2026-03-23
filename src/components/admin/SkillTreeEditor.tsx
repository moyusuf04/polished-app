'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings2, 
  Search, 
  Info, 
  MoveUp, 
  MoveDown, 
  ArrowRightLeft, 
  Link as LinkIcon, 
  ChevronRight, 
  CheckCircle2, 
  Trash2,
  X
} from 'lucide-react';
import { addPrerequisite, removePrerequisite, reorderLessons } from '@/actions/skilltree-actions';
import type { SkillTreeNode, SkillTreeEdge } from '@/actions/skilltree-actions';

interface Props {
  initialNodes: SkillTreeNode[];
  initialEdges: SkillTreeEdge[];
  onError: (msg: string) => void;
  onSuccess: (msg: string) => void;
}

export function SkillTreeEditor({ initialNodes, initialEdges, onError, onSuccess }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [localNodes, setLocalNodes] = useState<SkillTreeNode[]>(
    [...initialNodes].sort((a, b) => a.position - b.position)
  );

  // Keep local state in sync with parent updates (revalidation)
  useEffect(() => {
    setLocalNodes([...initialNodes].sort((a, b) => a.position - b.position));
  }, [initialNodes]);

  const selectedNode = localNodes.find(n => n.id === selectedId);
  
  // Prerequisites for selected node
  const activePrereqs = useMemo(() => {
    if (!selectedId) return [];
    return initialEdges
      .filter(e => e.target === selectedId)
      .map(e => e.source);
  }, [selectedId, initialEdges]);

  const filteredNodes = useMemo(() => {
    if (!searchQuery) return localNodes;
    return localNodes.filter(n => 
      n.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [localNodes, searchQuery]);

  const handleSwap = async (id1: string, id2: string) => {
    const n1 = localNodes.find(n => n.id === id1)!;
    const n2 = localNodes.find(n => n.id === id2)!;
    
    const p1 = n1.position;
    const p2 = n2.position;

    // Optimistic UI: Swap them locally
    const nextNodes = localNodes.map(n => {
      if (n.id === id1) return { ...n, position: p2 };
      if (n.id === id2) return { ...n, position: p1 };
      return n;
    }).sort((a, b) => a.position - b.position);
    
    setLocalNodes(nextNodes);

    // Sync to DB in one go
    const result = await reorderLessons([
      { id: id1, position: p2 },
      { id: id2, position: p1 }
    ]);
    
    if (result.success) {
      onSuccess('Lessons reordered.');
    } else {
      onError(result.error || 'Failed to sync reorder.');
      // Re-sync with actual state from parent if failed
      setLocalNodes([...initialNodes].sort((a, b) => a.position - b.position));
    }
  };

  const togglePrereq = async (sourceId: string) => {
    if (!selectedId) return;
    const isPresent = activePrereqs.includes(sourceId);
    
    if (isPresent) {
      const res = await removePrerequisite(selectedId, sourceId);
      if (res.success) onSuccess('Dependency removed.');
      else onError(res.error || 'Failed to remove dependency.');
    } else {
      const res = await addPrerequisite(selectedId, sourceId);
      if (res.success) onSuccess('Dependency added.');
      else onError(res.error || 'Failed to add dependency.');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in duration-700 min-h-[700px]">
      
      {/* 1. The Logical Grid Board */}
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div>
            <h2 className="text-[11px] font-bold text-white/20 uppercase tracking-[0.3em] mb-1 flex items-center gap-2">
              <Settings2 className="w-4 h-4" />
              Lesson Board
            </h2>
            <p className="text-white/40 text-[10px] tracking-wide font-light">
              Sequential order dictates the core learning flow.
            </p>
          </div>
          
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/10 group-focus-within:text-white/40 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter board..."
              className="bg-white/[0.03] border border-white/10 text-white rounded-sm pl-10 pr-4 py-2 text-[10px] font-bold tracking-widest uppercase outline-none focus:border-white/30 transition-all w-48"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNodes.map((node, i) => (
            <motion.div
              layout
              key={node.id}
              onClick={() => setSelectedId(node.id)}
              className={`relative p-6 border transition-all cursor-pointer group flex flex-col justify-between min-h-[140px] shadow-xl ${
                selectedId === node.id 
                  ? 'border-white bg-white/[0.05] shadow-white/5 ring-1 ring-white/20' 
                  : 'border-white/5 bg-[#0d0d10] hover:border-white/20 hover:bg-white/[0.02]'
              }`}
            >
              {/* Slot Number Badge */}
              <div className="absolute -top-3 left-6 px-2 py-0.5 bg-black border border-white/10 text-[9px] font-bold tracking-widest text-white/40 uppercase">
                 Slot {(node.position + 1).toString().padStart(2, '0')}
              </div>

              <div className="space-y-2">
                <p className="text-[9px] tracking-[0.2em] font-bold text-white/20 uppercase">{node.status}</p>
                <h3 className="text-base text-white font-serif leading-snug">{node.title}</h3>
                <p className="text-[9px] tracking-widest text-white/20 uppercase font-medium">{node.difficulty}</p>
              </div>

              {/* Interaction Bar */}
              <div className="flex items-center justify-between pt-4 mt-auto">
                 <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); i > 0 && handleSwap(node.id, localNodes[i-1].id); }}
                      disabled={i === 0}
                      className="p-1.5 text-white/10 hover:text-white disabled:opacity-0 transition-all"
                      title="Move Up"
                    >
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); i < localNodes.length - 1 && handleSwap(node.id, localNodes[i+1].id); }}
                      disabled={i === localNodes.length - 1}
                      className="p-1.5 text-white/10 hover:text-white disabled:opacity-0 transition-all"
                      title="Move Down"
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>
                 </div>
                 
                 <div className="flex items-center gap-3">
                    {initialEdges.some(e => e.target === node.id) && (
                      <span className="flex items-center gap-1 text-emerald-500/60 text-[8px] font-bold tracking-[0.2em] uppercase">
                        <LinkIcon className="w-2.5 h-2.5" />
                        Linked
                      </span>
                    )}
                    <ChevronRight className={`w-4 h-4 text-white/5 group-hover:text-white/30 transition-all ${selectedId === node.id ? 'translate-x-1 text-white/50' : ''}`} />
                 </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 2. Logical Dependency Sidebar */}
      <AnimatePresence mode="wait">
        {selectedNode ? (
          <motion.div
            key="sidebar"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="w-full lg:w-80 space-y-8 bg-[#0a0a0c] border border-white/5 p-8 rounded-sm shadow-2xl overflow-y-auto max-h-[700px] sticky top-24"
          >
            <div className="flex items-center justify-between mb-2">
               <h3 className="text-[11px] font-bold text-white/20 uppercase tracking-[0.3em]">Configure</h3>
               <button onClick={() => setSelectedId(null)} className="text-white/20 hover:text-white"><X className="w-4 h-4" /></button>
            </div>

            <div className="space-y-4">
              <h4 className="text-xl font-serif text-white">{selectedNode.title}</h4>
              <div className="flex flex-wrap gap-2">
                 <span className="px-2 py-0.5 bg-white/5 rounded-full text-[9px] font-bold text-white/30 uppercase tracking-widest">{selectedNode.difficulty}</span>
                 <span className="px-2 py-0.5 bg-white/5 rounded-full text-[9px] font-bold text-white/30 uppercase tracking-widest">{selectedNode.status}</span>
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-white/5">
              <div className="space-y-2">
                 <h5 className="text-[10px] font-bold text-white uppercase tracking-[0.25em] flex items-center gap-2">
                    <LinkIcon className="w-3.5 h-3.5 text-emerald-500" />
                    Prerequisites
                 </h5>
                 <p className="text-[10px] text-white/30 font-light leading-relaxed">
                   Select lessons that must be completed before this one is unlocked.
                 </p>
              </div>

              <div className="space-y-1 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                {localNodes.filter(n => n.id !== selectedId).map(other => {
                  const isPrereq = activePrereqs.includes(other.id);
                  return (
                    <button
                      key={other.id}
                      onClick={() => togglePrereq(other.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm text-left transition-all border ${
                        isPrereq 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-100' 
                          : 'bg-white/[0.02] border-white/5 text-white/30 hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                        isPrereq ? 'bg-emerald-500 border-emerald-500' : 'border-white/20'
                      }`}>
                        {isPrereq && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-[11px] font-medium truncate">{other.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-6 border-t border-white/5">
              <p className="text-[9px] tracking-widest text-white/20 uppercase font-bold flex items-center gap-2">
                <Info className="w-3.5 h-3.5" />
                Slot {selectedNode.position + 1} Selected
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="hidden lg:flex flex-col items-center justify-center w-80 border border-white/5 border-dashed rounded-sm opacity-20 p-12 text-center space-y-4">
             <Settings2 className="w-12 h-12" />
             <p className="text-[11px] font-bold tracking-[0.3em] uppercase">Select a node to configure</p>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
