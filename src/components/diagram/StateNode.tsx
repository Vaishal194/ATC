import { memo } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';

export interface StateNodeData extends Record<string, unknown> {
  label?: string;
  isInitial?: boolean;
  isFinal?: boolean;
  isActive?: boolean;
  isHighlighted?: boolean;
  sublabel?: string;
  badge?: string;
}

export const StateNode = memo((props: NodeProps<Node<StateNodeData>>) => {
  const data = props.data || {};
  const label = data.label || props.id || '';
  const isInitial = Boolean(data.isInitial);
  const isFinal = Boolean(data.isFinal);
  const isActive = Boolean(data.isActive);
  const isHighlighted = Boolean(data.isHighlighted);
  const sublabel = data.sublabel;
  const badge = data.badge;

  const activeClasses = isActive
    ? 'ring-4 ring-cyan-400 border-cyan-400 bg-cyan-950/80 shadow-[0_0_25px_rgba(6,182,212,0.8)] active-state-glow'
    : isHighlighted
    ? 'ring-2 ring-purple-400 border-purple-400 bg-purple-950/60 shadow-[0_0_15px_rgba(168,85,247,0.5)]'
    : 'border-slate-600 bg-dark-900/95 hover:border-cyan-400 shadow-lg';

  return (
    <div className="relative group flex items-center justify-center select-none w-16 h-16 cursor-grab active:cursor-grabbing">
      {/* Dedicated Self-Loop Handles on Top */}
      <Handle
        type="source"
        position={Position.Top}
        id="loop-source"
        style={{ left: '32%', top: '2px', opacity: 0, width: 6, height: 6 }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="loop-target"
        style={{ left: '68%', top: '2px', opacity: 0, width: 6, height: 6 }}
      />

      {/* Standard Directional Handles for Inter-Node Transitions */}
      <Handle
        type="target"
        position={Position.Top}
        className="opacity-0 w-3 h-3 !bg-transparent border-0"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="opacity-0 w-3 h-3 !bg-transparent border-0"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="opacity-0 w-3 h-3 !bg-transparent border-0"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="opacity-0 w-3 h-3 !bg-transparent border-0"
      />

      {/* Initial State Arrow */}
      {isInitial && (
        <div className="absolute -left-9 flex items-center text-cyan-400 pointer-events-none z-20 animate-pulse">
          <svg
            className="w-8 h-8 filter drop-shadow-[0_0_4px_rgba(6,182,212,0.8)]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="2" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </div>
      )}

      {/* Main Outer State Circle */}
      <div
        className={`w-16 h-16 rounded-full border-2 flex flex-col items-center justify-center transition-all duration-300 relative ${activeClasses}`}
      >
        {/* Double Circle for Accepting/Final State */}
        {isFinal && (
          <div
            className={`absolute inset-1 rounded-full border-2 pointer-events-none transition-colors duration-300 ${
              isActive
                ? 'border-cyan-300'
                : isHighlighted
                ? 'border-purple-300'
                : 'border-slate-500 group-hover:border-cyan-400'
            }`}
          />
        )}

        {/* State Label */}
        <span
          className={`font-mono font-bold text-sm tracking-tight text-center px-1 truncate max-w-[52px] z-10 ${
            isActive ? 'text-cyan-200' : isHighlighted ? 'text-purple-200' : 'text-slate-100'
          }`}
          title={label}
        >
          {label}
        </span>

        {/* Optional small sublabel (e.g. subset {q0, q1}) */}
        {sublabel && (
          <span
            className="font-mono text-[9px] text-slate-400 tracking-tighter truncate max-w-[50px] z-10"
            title={sublabel}
          >
            {sublabel}
          </span>
        )}

        {/* Optional badge */}
        {badge && (
          <span className="absolute -top-1.5 -right-1.5 bg-cyan-600 text-[9px] font-mono font-bold text-white px-1 rounded-full border border-dark-900 z-10">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
});

StateNode.displayName = 'StateNode';
