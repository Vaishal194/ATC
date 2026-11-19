import React, { useMemo, useCallback, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  NodeTypes,
  EdgeTypes,
  useNodesState,
  useEdgesState,
  Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Automaton } from '../types/automata';
import { StateNode, StateNodeData } from './diagram/StateNode';
import { SelfLoopEdge } from './diagram/SelfLoopEdge';
import { automatonToReactFlow } from './diagram/diagramUtils';
import { LayoutGrid, Maximize2, AlertTriangle, RefreshCw } from 'lucide-react';

interface StateDiagramProps {
  automaton: Automaton;
  activeStateIds?: string[];
  highlightedStateIds?: string[];
  activeTransitionIds?: string[];
  onNodeDragStop?: (event: unknown, node: Node) => void;
  className?: string;
  title?: string;
  typeBadge?: string;
}

const nodeTypes: NodeTypes = {
  stateNode: StateNode,
};

const edgeTypes: EdgeTypes = {
  selfLoop: SelfLoopEdge,
};

// Error Boundary for React Flow canvas
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class DiagramErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('StateDiagram Error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-[350px] flex flex-col items-center justify-center p-6 text-center bg-dark-900/90 text-slate-300">
          <AlertTriangle className="w-8 h-8 text-amber-400 mb-2" />
          <h4 className="font-bold text-slate-100 text-sm mb-1">
            Diagram Canvas Notice
          </h4>
          <p className="text-xs text-slate-400 max-w-md mb-3">
            Unable to render graph nodes. The transition table remains fully functional below.
          </p>
          <button
            onClick={this.handleReset}
            className="px-3 py-1 bg-dark-800 hover:bg-dark-700 border border-slate-700 rounded-lg text-xs font-mono text-cyan-300 flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload Canvas</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Inner Canvas Component that has access to useReactFlow
interface CanvasContentProps {
  automaton: Automaton;
  activeStateIds?: string[];
  highlightedStateIds?: string[];
  activeTransitionIds?: string[];
  onNodeDragStop?: (event: unknown, node: Node) => void;
  title?: string;
  typeBadge?: string;
}

const CanvasContent: React.FC<CanvasContentProps> = ({
  automaton,
  activeStateIds = [],
  highlightedStateIds = [],
  activeTransitionIds = [],
  onNodeDragStop,
  title,
  typeBadge,
}) => {
  const { fitView } = useReactFlow();

  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () =>
      automatonToReactFlow(
        automaton,
        activeStateIds,
        highlightedStateIds,
        activeTransitionIds
      ),
    [automaton, activeStateIds, highlightedStateIds, activeTransitionIds]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<StateNodeData>>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync nodes whenever automaton changes, but preserve user-adjusted positions!
  useEffect(() => {
    setNodes((currentNodes) => {
      const positionMap = new Map<string, { x: number; y: number }>();
      for (const n of currentNodes) {
        positionMap.set(n.id, n.position);
      }
      return initialNodes.map((n) => {
        const savedPos = positionMap.get(n.id);
        if (savedPos) {
          return { ...n, position: savedPos };
        }
        return n;
      });
    });
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Smoothly center the diagram whenever automaton structure changes
  useEffect(() => {
    if (automaton.states.length === 0) return;
    const timer = setTimeout(() => {
      fitView({ padding: 0.25, duration: 300 });
    }, 80);
    return () => clearTimeout(timer);
  }, [automaton.id, automaton.states.length, automaton.transitions.length, fitView]);

  // Auto-layout in clean circle and reset positions
  const handleAutoLayout = useCallback(() => {
    const nodeCount = automaton.states.length;
    const radius = Math.max(160, nodeCount * 45);
    const centerX = 320;
    const centerY = 240;

    setNodes((prevNodes) =>
      prevNodes.map((n, idx) => {
        const angle = (2 * Math.PI * idx) / Math.max(1, nodeCount) - Math.PI / 2;
        return {
          ...n,
          position: {
            x: Math.round(centerX + radius * Math.cos(angle)),
            y: Math.round(centerY + radius * Math.sin(angle)),
          },
        };
      })
    );

    setTimeout(() => {
      fitView({ padding: 0.25, duration: 300 });
    }, 50);
  }, [automaton.states.length, setNodes, fitView]);

  const handleManualFitView = () => {
    fitView({ padding: 0.25, duration: 300 });
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Header Bar Overlay */}
      {(title || typeBadge) && (
        <div className="absolute top-3 left-4 z-10 flex items-center gap-2 pointer-events-none">
          {title && (
            <span className="text-xs font-semibold text-slate-200 bg-dark-900/90 border border-slate-700/60 px-3 py-1 rounded-md backdrop-blur-md shadow-md">
              {title}
            </span>
          )}
          {typeBadge && (
            <span
              className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md border ${
                typeBadge === 'DFA'
                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                  : 'bg-purple-500/10 text-purple-400 border-purple-500/30'
              }`}
            >
              {typeBadge}
            </span>
          )}
        </div>
      )}

      {/* Action Buttons: Auto-Layout & Fit-View */}
      <div className="absolute top-3 right-4 z-10 flex items-center gap-1.5">
        <button
          onClick={handleManualFitView}
          title="Center and fit diagram"
          className="bg-dark-850/90 hover:bg-dark-700 border border-slate-700/70 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 backdrop-blur-md transition-all shadow-md"
        >
          <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Fit</span>
        </button>
        <button
          onClick={handleAutoLayout}
          title="Auto-arrange states in circular layout"
          className="bg-dark-850/90 hover:bg-dark-700 border border-slate-700/70 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 backdrop-blur-md transition-all shadow-md"
        >
          <LayoutGrid className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Auto Layout</span>
        </button>
      </div>

      {/* Main React Flow Canvas */}
      <div className="flex-1 w-full h-full min-h-[380px] relative">
        {automaton.states.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-500">
            <span className="text-sm">No states defined in automaton.</span>
            <span className="text-xs mt-1 text-slate-600">Enter states above or load an example.</span>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeDragStop={onNodeDragStop}
            nodesDraggable={true}
            elementsSelectable={true}
            selectNodesOnDrag={false}
            fitView
            fitViewOptions={{ padding: 0.25 }}
            minZoom={0.15}
            maxZoom={2.5}
            proOptions={{ hideAttribution: true }}
            style={{ width: '100%', height: '100%' }}
          >
            <Background
              color="#334155"
              gap={20}
              size={1.5}
              variant={BackgroundVariant.Dots}
            />
            <Controls
              className="!bg-dark-850/95 !border !border-slate-700/70 !rounded-lg !shadow-xl !fill-slate-300 [&>button]:!border-b-slate-700/70 hover:[&>button]:!bg-dark-700"
              showInteractive={false}
            />
          </ReactFlow>
        )}
      </div>

      {/* Legend Footer */}
      <div className="bg-dark-950/80 border-t border-slate-800/80 px-4 py-1.5 flex items-center justify-between text-[11px] text-slate-400 font-mono shrink-0">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1">
            <span className="text-cyan-400 font-bold">→◯</span> Start
          </span>
          <span className="flex items-center gap-1">
            <span className="text-slate-300 font-bold">◯</span> State
          </span>
          <span className="flex items-center gap-1">
            <span className="text-purple-400 font-bold">◎</span> Final (Accept)
          </span>
        </div>
        <div className="hidden sm:inline text-slate-500 text-[10px]">
          Drag states to reposition • Scroll to zoom
        </div>
      </div>
    </div>
  );
};

export const StateDiagram: React.FC<StateDiagramProps> = ({
  automaton,
  activeStateIds,
  highlightedStateIds,
  activeTransitionIds,
  onNodeDragStop,
  className = '',
  title,
  typeBadge,
}) => {
  return (
    <div
      className={`relative w-full h-[460px] min-h-[460px] bg-dark-900/60 rounded-xl border border-slate-800/80 overflow-hidden shadow-inner flex flex-col ${className}`}
    >
      <DiagramErrorBoundary>
        <ReactFlowProvider>
          <CanvasContent
            automaton={automaton}
            activeStateIds={activeStateIds}
            highlightedStateIds={highlightedStateIds}
            activeTransitionIds={activeTransitionIds}
            onNodeDragStop={onNodeDragStop}
            title={title}
            typeBadge={typeBadge}
          />
        </ReactFlowProvider>
      </DiagramErrorBoundary>
    </div>
  );
};
