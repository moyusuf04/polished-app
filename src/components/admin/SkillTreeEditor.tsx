'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
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
  X,
  Layers
} from 'lucide-react';
import { addPrerequisite, removePrerequisite, reorderLessons, toggleLessonCategory } from '@/actions/skilltree-actions';
import type { SkillTreeNode, SkillTreeEdge } from '@/actions/skilltree-actions';

interface Category { id: string; name: string; theme_color: string; }

interface Props {
  initialNodes: SkillTreeNode[];
  initialEdges: SkillTreeEdge[];
  categories: Category[];
  onError: (msg: string) => void;
  onSuccess: (msg: string) => void;
  onRefresh?: () => Promise<void> | void;
}

export function SkillTreeEditor({ initialNodes, initialEdges, categories, onError, onSuccess, onRefresh }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // High-performance local state for instant feedback
  const [localNodes, setLocalNodes] = useState<SkillTreeNode[]>(
    [...initialNodes].sort((a, b) => a.position - b.position)
  );
  const [localEdges, setLocalEdges] = useState<SkillTreeEdge[]>(initialEdges);
  const [isSyncing, setIsSyncing] = useState(false);

  // Re-sync with server data when parent re-fetches (e.g. after onRefresh finishes)
  useEffect(() => {
    if (!isSyncing) {
      setLocalNodes([...initialNodes].sort((a, b) => a.position - b.position));
      setLocalEdges(initialEdges);
    }
  }, [initialNodes, initialEdges, isSyncing]);

  const selectedNode = localNodes.find(n => n.id === selectedId);
  
  // Prerequisites for selected node (from local state for instant updates)
  const activePrereqs = useMemo(() => {
    if (!selectedId) return [];
    return localEdges
      .filter(e => e.target === selectedId)
      .map(e => e.source);
  }, [selectedId, localEdges]);

  const filteredNodes = useMemo(() => {
    if (!searchQuery) return localNodes;
    return localNodes.filter(n => 
      n.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [localNodes, searchQuery]);

  const syncHierarchy = async (nodesToSync: SkillTreeNode[]) => {
    setIsSyncing(true);
    const result = await reorderLessons(
      nodesToSync.map((n, i) => ({ id: n.id, position: i }))
    );
    if (result.success) {
      onSuccess('Hierarchy synchronized.');
      await onRefresh?.();
    } else {
      onError(result.error || 'Failed to sync hierarchy.');
    }
    setIsSyncing(false);
  };

  const handleSwap = async (id1: string, id2: string) => {
    const idx1 = localNodes.findIndex(n => n.id === id1);
    const idx2 = localNodes.findIndex(n => n.id === id2);
    if (idx1 === -1 || idx2 === -1) return;

    const nextNodes = [...localNodes];
    [nextNodes[idx1], nextNodes[idx2]] = [nextNodes[idx2], nextNodes[idx1]];
    
    // Instant UI update
    setLocalNodes(nextNodes);
    await syncHierarchy(nextNodes);
  };

  const handleReorder = (newOrder: SkillTreeNode[]) => {
    setLocalNodes(newOrder); // Instant visual shift
  };

  const handleDragEnd = async () => {
    await syncHierarchy(localNodes);
  };

  const handleManualPosSet = async (nodeId: string, newPos: number) => {
    const targetPos = Math.max(0, Math.min(newPos, localNodes.length - 1));
    const targetNode = localNodes.find(n => n.id === nodeId)!;
    
    const withoutNode = localNodes.filter(n => n.id !== nodeId);
    const nextNodes = [
      ...withoutNode.slice(0, targetPos),
      targetNode,
      ...withoutNode.slice(targetPos)
    ];

    setLocalNodes(nextNodes);
    await syncHierarchy(nextNodes);
  };

  const togglePrereq = async (sourceId: string) => {
    if (!selectedId) return;
    const isPresent = activePrereqs.includes(sourceId);
    
    // Instant UI update
    if (isPresent) {
      setLocalEdges(localEdges.filter(e => !(e.target === selectedId && e.source === sourceId)));
      const res = await removePrerequisite(selectedId, sourceId);
      if (res.success) {
        onSuccess('Dependency removed.');
        await onRefresh?.();
      } else onError(res.error || 'Failed to remove dependency.');
    } else {
      setLocalEdges([...localEdges, { target: selectedId, source: sourceId }]);
      const res = await addPrerequisite(selectedId, sourceId);
      if (res.success) {
        onSuccess('Dependency added.');
        await onRefresh?.();
      } else onError(res.error || 'Failed to add dependency.');
    }
  };

  const toggleCategoryLink = async (catId: string) => {
    if (!selectedId) return;
    
    // Optimistic UI update
    setLocalNodes(localNodes.map(n => {
      if (n.id === selectedId) {
        const has = n.category_ids.includes(catId);
        return {
          ...n,
          category_ids: has ? n.category_ids.filter(id => id !== catId) : [...n.category_ids, catId]
        };
      }
      return n;
    }));

    const res = await toggleLessonCategory(selectedId, catId);
    if (res.success) {
      onSuccess('Link updated.');
      await onRefresh?.();
    } else {
      onError('Failed to update link.');
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
              Drag to rank. Sequential order dictates the core learning flow.
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

        <Reorder.Group 
          axis="y" 
          values={localNodes} 
          onReorder={handleReorder}
          className="space-y-4"
        >
          {filteredNodes.map((node, i) => (
            <Reorder.Item
              value={node}
              key={node.id}
              onClick={() => setSelectedId(node.id)}
              onDragEnd={handleDragEnd}
              transition={{ type: 'spring', stiffness: 500, damping: 40, mass: 1 }}
              className={`relative p-6 border transition-all cursor-grab active:cursor-grabbing group flex flex-col justify-between min-h-[100px] shadow-xl ${
                selectedId === node.id 
                  ? 'border-white bg-white/[0.08] shadow-white/5 ring-1 ring-white/20 z-10' 
                  : 'border-white/5 bg-[#0d0d10] hover:border-white/10'
              }`}
            >
              {/* Slot Number Badge */}
              <div className="absolute -top-3 left-6 px-2 py-0.5 bg-black border border-white/10 text-[9px] font-bold tracking-widest text-white/40 uppercase">
                 Slot {(i + 1).toString().padStart(2, '0')}
              </div>

              <div className="space-y-2">
                <p className="text-[9px] tracking-[0.2em] font-bold text-white/20 uppercase">{node.status}</p>
                <div className="flex items-center justify-between">
                  <h3 className="text-base text-white font-serif leading-snug">{node.title}</h3>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); i > 0 && handleSwap(node.id, localNodes[i-1].id); }}
                      disabled={i === 0}
                      className="p-1.5 text-white/40 hover:text-white disabled:opacity-0 transition-all"
                      title="Move Up"
                    >
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); i < localNodes.length - 1 && handleSwap(node.id, localNodes[i+1].id); }}
                      disabled={i === localNodes.length - 1}
                      className="p-1.5 text-white/40 hover:text-white disabled:opacity-0 transition-all"
                      title="Move Down"
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-[9px] tracking-widest text-white/20 uppercase font-medium">{node.difficulty}</p>
                  {node.category_ids.length > 1 && (
                    <span className="flex items-center gap-1 text-amber-500/60 text-[8px] font-bold tracking-[0.2em] uppercase">
                      <Layers className="w-2.5 h-2.5" />
                      Hybrid ({node.category_ids.length})
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 mt-auto">
                 <div className="flex items-center gap-3">
                    {localEdges.some(e => e.target === node.id) && (
                      <span className="flex items-center gap-1 text-emerald-500/60 text-[8px] font-bold tracking-[0.2em] uppercase">
                        <LinkIcon className="w-2.5 h-2.5" />
                        Linked
                      </span>
                    )}
                    <ChevronRight className={`w-4 h-4 text-white/5 group-hover:text-white/30 transition-all ${selectedId === node.id ? 'translate-x-1 text-white/50' : ''}`} />
                 </div>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
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

            {/* Hybrid Categories */}
            <div className="space-y-4 pt-6 border-t border-white/5">
               <div className="space-y-2">
                  <h5 className="text-[10px] font-bold text-white uppercase tracking-[0.25em] flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-amber-500" />
                    Cross-Category (Hybrid)
                  </h5>
                  <p className="text-[10px] text-white/30 font-light leading-relaxed">
                    Link this lesson to multiple tracks simultaneously.
                  </p>
               </div>
               <div className="flex flex-wrap gap-2">
                 {categories.map(cat => {
                   const isActive = selectedNode.category_ids.includes(cat.id);
                   return (
                     <button
                       key={cat.id}
                       onClick={() => toggleCategoryLink(cat.id)}
                       className={`px-3 py-1.5 rounded-sm border transition-all text-[9px] font-bold tracking-widest uppercase ${
                         isActive 
                           ? 'bg-amber-500 text-black border-amber-500' 
                           : 'bg-white/[0.02] border-white/5 text-white/40 hover:border-white/20'
                       }`}
                     >
                       {cat.name}
                     </button>
                   );
                 })}
               </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-white/5">
              <div className="space-y-2">
                 <h5 className="text-[10px] font-bold text-white uppercase tracking-[0.25em] flex items-center gap-2">
                    <LinkIcon className="w-3.5 h-3.5 text-emerald-500" />
                    Prerequisites
                 </h5>
                 <p className="text-[10px] text-white/30 font-light leading-relaxed">
                   Select lessons required to unlock this slot.
                 </p>
              </div>

              <div className="space-y-1 max-h-[200px] overflow-y-auto pr-2 scrollbar-hide">
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

            <div className="pt-6 border-t border-white/5 space-y-4">
              <div className="space-y-2">
                <h5 className="text-[10px] font-bold text-white uppercase tracking-[0.25em]">Direct Position Sync</h5>
                <select 
                  value={localNodes.findIndex(n => n.id === selectedId)}
                  onChange={(e) => handleManualPosSet(selectedNode.id, parseInt(e.target.value))}
                  className="w-full bg-white/[0.03] border border-white/10 text-white rounded-sm px-3 py-2 text-[11px] font-bold tracking-widest uppercase outline-none focus:border-white/30"
                >
                  {localNodes.map((_, i) => (
                    <option key={i} value={i} className="bg-[#0d0d10]">Slot {i + 1}</option>
                  ))}
                </select>
              </div>
              <p className="text-[9px] tracking-widest text-white/20 uppercase font-bold flex items-center gap-2">
                <Info className="w-3.5 h-3.5" />
                Slot {localNodes.findIndex(n => n.id === selectedId) + 1} Selected
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
