import { Node, Edge, MarkerType } from '@xyflow/react';
import { Automaton } from '../../types/automata';
import { StateNodeData } from './StateNode';

/**
 * Converts an Automaton data model into React Flow Nodes and Edges
 */
export function automatonToReactFlow(
  automaton: Automaton,
  activeStateIds: string[] = [],
  highlightedStateIds: string[] = [],
  activeTransitionIds: string[] = []
): { nodes: Node<StateNodeData>[]; edges: Edge[] } {
  const nodeCount = automaton.states.length;
  const radius = Math.max(160, nodeCount * 45);
  const centerX = 320;
  const centerY = 240;

  // 1. Generate Nodes
  const nodes: Node<StateNodeData>[] = automaton.states.map((state, idx) => {
    // If state doesn't have coordinates, arrange in a circle
    let x = state.x;
    let y = state.y;
    if (x === undefined || y === undefined || (x === 0 && y === 0 && nodeCount > 1)) {
      const angle = (2 * Math.PI * idx) / Math.max(1, nodeCount) - Math.PI / 2;
      x = Math.round(centerX + radius * Math.cos(angle));
      y = Math.round(centerY + radius * Math.sin(angle));
    }

    const isActive = activeStateIds.includes(state.id);
    const isHighlighted = highlightedStateIds.includes(state.id);

    // Extract sublabel if label has "Name: {states}" format
    let displayLabel = state.label;
    let sublabel: string | undefined = undefined;
    if (state.label.includes(':')) {
      const parts = state.label.split(':');
      displayLabel = parts[0].trim();
      sublabel = parts[1].trim();
    }

    return {
      id: state.id,
      type: 'stateNode',
      position: { x, y },
      width: 64,
      height: 64,
      measured: { width: 64, height: 64 },
      draggable: true,
      data: {
        label: displayLabel,
        sublabel,
        isInitial: state.isInitial,
        isFinal: state.isFinal,
        isActive,
        isHighlighted,
      },
    };
  });

  // 2. Generate Edges (Group transitions between same pair)
  const edgeGroups = new Map<
    string,
    { from: string; to: string; symbols: string[]; transitionIds: string[] }
  >();

  automaton.transitions.forEach((t) => {
    const key = `${t.from}->${t.to}`;
    const existing = edgeGroups.get(key) || {
      from: t.from,
      to: t.to,
      symbols: [],
      transitionIds: [],
    };
    if (!existing.symbols.includes(t.symbol)) {
      existing.symbols.push(t.symbol);
    }
    existing.transitionIds.push(t.id);
    edgeGroups.set(key, existing);
  });

  const edges: Edge[] = [];

  edgeGroups.forEach((group, key) => {
    const isSelfLoop = group.from === group.to;
    const isTraversed = group.transitionIds.some((id) => activeTransitionIds.includes(id));
    const label = group.symbols.join(', ');

    const reverseKey = `${group.to}->${group.from}`;
    const hasReverse = edgeGroups.has(reverseKey) && !isSelfLoop;

    const strokeColor = isTraversed ? '#06b6d4' : '#64748b';

    if (isSelfLoop) {
      edges.push({
        id: `edge_${key}`,
        source: group.from,
        target: group.to,
        sourceHandle: 'loop-source',
        targetHandle: 'loop-target',
        type: 'selfLoop',
        label: label,
        animated: isTraversed,
        style: {
          stroke: strokeColor,
          strokeWidth: isTraversed ? 3.5 : 2.5,
          filter: isTraversed ? 'drop-shadow(0 0 6px rgba(6, 182, 212, 0.9))' : undefined,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 18,
          height: 18,
          color: strokeColor,
        },
      });
    } else {
      edges.push({
        id: `edge_${key}`,
        source: group.from,
        target: group.to,
        label: label,
        type: 'bezier',
        animated: isTraversed,
        style: {
          stroke: strokeColor,
          strokeWidth: isTraversed ? 3.5 : 2,
          filter: isTraversed ? 'drop-shadow(0 0 6px rgba(6, 182, 212, 0.9))' : undefined,
        },
        labelStyle: {
          fill: isTraversed ? '#22d3ee' : '#cbd5e1',
          fontWeight: 700,
          fontFamily: 'monospace',
          fontSize: 13,
        },
        labelBgStyle: {
          fill: '#0f172a',
          fillOpacity: 0.85,
          rx: 4,
          ry: 4,
        },
        labelBgPadding: [6, 3] as [number, number],
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 18,
          height: 18,
          color: strokeColor,
        },
        data: {
          hasReverse,
        },
      });
    }
  });

  return { nodes, edges };
}
