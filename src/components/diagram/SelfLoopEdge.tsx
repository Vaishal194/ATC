import React from 'react';
import { BaseEdge, EdgeLabelRenderer, EdgeProps } from '@xyflow/react';

export const SelfLoopEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  label,
  style,
  markerEnd,
}) => {
  // If targetX / targetY are available and different, use them; otherwise use sourceX / sourceY
  const startX = sourceX - 12;
  const startY = sourceY;
  const endX = (targetX !== undefined && targetX !== sourceX) ? targetX : sourceX + 12;
  const endY = (targetY !== undefined && targetY !== sourceY) ? targetY : sourceY;

  // Cubic Bezier loop arching 65px above the node circle
  const edgePath = `M ${startX} ${startY} C ${startX - 35} ${startY - 65}, ${endX + 35} ${endY - 65}, ${endX} ${endY}`;

  // Center of label above the apex of the loop
  const labelX = (startX + endX) / 2;
  const labelY = Math.min(startY, endY) - 52;

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={style} markerEnd={markerEnd} />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            }}
            className="bg-dark-950/95 text-cyan-300 border border-slate-700/90 px-2 py-0.5 rounded font-mono font-bold text-xs shadow-md select-none nodrag nopan pointer-events-none"
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};
