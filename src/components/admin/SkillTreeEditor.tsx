'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Handle,
  Position,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { Settings2, Search, Info } from 'lucide-react';
import { addPrerequisite, removePrerequisite } from '@/actions/skilltree-actions';
import type { SkillTreeNode, SkillTreeEdge } from '@/actions/skilltree-actions';

interface Props {
  initialNodes: SkillTreeNode[];
  initialEdges: SkillTreeEdge[];
  onError: (msg: string) => void;
  onSuccess: (msg: string) => void;
}

// Dagre layout utility
function getLayoutedElements(nodes: Node[], edges: Edge[]) {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'TB', nodesep: 100, ranksep: 120 });

  nodes.forEach(node => g.setNode(node.id, { width: 220, height: 80 }));
  edges.forEach(edge => g.setEdge(edge.source, edge.target));

  dagre.layout(g);

  const layoutedNodes = nodes.map(node => {
    const pos = g.node(node.id);
    return { ...node, position: { x: pos.x - 110, y: pos.y - 40 } };
  });

  return { nodes: layoutedNodes, edges };
}

// Custom node component matching the "Obsidian" identity
function LessonNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as { label: string; status: string; difficulty: string; highlighted: boolean };
  
  return (
    <div className={`px-6 py-4 border transition-all duration-300 min-w-[200px] shadow-2xl relative overflow-hidden ${
      selected 
        ? 'border-white bg-white/[0.05] shadow-white/5' 
        : nodeData.highlighted 
        ? 'border-[#52B788] bg-[#52B788]/5 shrink-0'
        : 'border-white/10 bg-[#0d0d10] opacity-80'
    }`}>
      {/* Decorative accent */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <Handle 
        type="target" 
        position={Position.Top} 
        className="!bg-[#52B788] !w-3 !h-3 !border-none shadow-[0_0_10px_rgba(82,183,136,0.6)]" 
      />
      
      <div className="text-left">
        <p className="text-[10px] tracking-[0.2em] font-bold text-white/20 uppercase mb-2">{nodeData.status}</p>
        <p className="text-sm text-white font-serif tracking-tight leading-tight mb-2 truncate">{nodeData.label}</p>
        <p className="text-[9px] tracking-widest text-white/10 uppercase font-medium">{nodeData.difficulty} Tier</p>
      </div>
      
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!bg-[#52B788] !w-3 !h-3 !border-none shadow-[0_0_10px_rgba(82,183,136,0.6)]" 
      />
    </div>
  );
}

const nodeTypes = { lesson: LessonNodeComponent };

export function SkillTreeEditor({ initialNodes, initialEdges, onError, onSuccess }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIds, setHighlightedIds] = useState<Set<string>>(new Set());

  // Convert to ReactFlow format
  const rfNodes: Node[] = useMemo(() => initialNodes.map(n => ({
    id: n.id,
    type: 'lesson',
    position: { x: 0, y: 0 },
    data: {
      label: n.title,
      status: n.status,
      difficulty: n.difficulty,
      highlighted: highlightedIds.has(n.id),
    },
  })), [initialNodes, highlightedIds]);

  const rfEdges: Edge[] = useMemo(() => initialEdges.map(e => ({
    id: `${e.source}-${e.target}`,
    source: e.source,
    target: e.target,
    animated: true,
    style: { stroke: '#52B788', strokeWidth: 2, opacity: highlightedIds.has(e.source) ? 1 : 0.4 },
  })), [initialEdges, highlightedIds]);

  const layouted = useMemo(() => getLayoutedElements(rfNodes, rfEdges), [rfNodes, rfEdges]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layouted.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layouted.edges);

  useEffect(() => {
    const l = getLayoutedElements(rfNodes, rfEdges);
    setNodes(l.nodes);
    setEdges(l.edges);
  }, [initialNodes, initialEdges, highlightedIds, setNodes, setEdges, rfNodes, rfEdges]);

  const onConnect = useCallback(async (params: Connection) => {
    if (!params.source || !params.target) return;
    if (params.source === params.target) {
      onError('Recursive dependency detected. A lesson cannot require itself.');
      return;
    }

    setEdges(eds => addEdge({ 
      ...params, 
      animated: true, 
      style: { stroke: 'rgba(255,255,255,0.05)', strokeWidth: 1.5 } 
    }, eds));

    const result = await addPrerequisite(params.target, params.source);
    if (!result.success) {
      setEdges(eds => eds.filter(e => !(e.source === params.source && e.target === params.target)));
      onError(result.error ?? 'Failed to synchronize graph change.');
    } else {
      onSuccess('Dependency mapping committed.');
    }
  }, [setEdges, onError, onSuccess]);

  const onEdgeDoubleClick = useCallback(async (_: React.MouseEvent, edge: Edge) => {
    setEdges(eds => eds.filter(e => e.id !== edge.id));

    const result = await removePrerequisite(edge.target, edge.source);
    if (!result.success) {
      setEdges(eds => [...eds, edge]);
      onError(result.error ?? 'Failed to remove dependency.');
    } else {
      onSuccess('Dependency removed.');
    }
  }, [setEdges, onError, onSuccess]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    const prereqEdges = edges.filter(e => e.target === node.id);
    const prereqIds = new Set(prereqEdges.map(e => e.source));
    setHighlightedIds(prereqIds);
  }, [edges]);

  const onPaneClick = useCallback(() => setHighlightedIds(new Set()), []);

  const filteredNodes = useMemo(() => {
    if (!searchQuery) return nodes;
    return nodes.map(n => ({
      ...n,
      hidden: !(n.data as { label: string }).label.toLowerCase().includes(searchQuery.toLowerCase()),
    }));
  }, [nodes, searchQuery]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
        <div>
          <h2 className="text-[11px] font-bold text-white/20 uppercase tracking-[0.3em] mb-2 flex items-center gap-3">
            <Settings2 className="w-4 h-4" />
            Dependency Architecture
          </h2>
          <p className="text-white/40 text-xs tracking-wide font-light flex items-center gap-2">
            <Info className="w-3 h-3 text-[#52B788]" />
            Connect nodes to establish sequence. Double-click edges to sever.
          </p>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within:text-white/40 transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search hierarchy..."
            className="bg-white/[0.03] border border-white/10 text-white rounded-sm pl-12 pr-6 py-3 text-[11px] font-bold tracking-widest uppercase outline-none focus:border-white/30 transition-all w-full md:w-64"
          />
        </div>
      </div>

      <div className="h-[700px] bg-[#09090b] border border-white/5 relative overflow-hidden shadow-2xl rounded-sm group/flow">
        <ReactFlow
          nodes={filteredNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgeDoubleClick={onEdgeDoubleClick}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          fitView
          proOptions={{ hideAttribution: true }}
          minZoom={0.2}
          maxZoom={2}
        >
          <Controls className="!bg-[#0d0d10] !border-white/10 !rounded-sm !shadow-2xl [&>button]:!bg-transparent [&>button]:!border-white/5 [&>button]:!text-white/40 [&>button:hover]:!text-white transition-colors" />
          <Background variant={BackgroundVariant.Lines} gap={60} size={1} color="rgba(255,255,255,0.02)" />
        </ReactFlow>
        
        {/* Floating legend */}
        <div className="absolute bottom-6 right-6 px-4 py-3 bg-[#0d0d10]/80 backdrop-blur-md border border-white/5 rounded-sm pointer-events-none">
          <p className="text-[9px] tracking-widest text-white/20 uppercase font-bold flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#52B788] animate-pulse" />
            Graph Synchronization Online
          </p>
        </div>
      </div>
    </div>
  );
}
