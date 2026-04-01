import type { ReactElement } from 'react';
import { TERRAIN_COLORS } from '../../../canvas/graphics/HexStyles';
import { Wedge } from '../Wedge';
import type { SvgWedgeSegmentRendererProps } from './types';
import { getEdgeMidpoint, isLinkedToCenter } from './utils';

export function renderRailWedge(props: SvgWedgeSegmentRendererProps): ReactElement {
  const edgeMidpoint = getEdgeMidpoint(props.segmentIndex);
  const target = isLinkedToCenter(props.terrain)
    ? { x: 0, y: 0 }
    : { x: edgeMidpoint.x / 2, y: edgeMidpoint.y / 2 };

  const dx = target.x - edgeMidpoint.x;
  const dy = target.y - edgeMidpoint.y;
  const length = Math.hypot(dx, dy) || 1;

  // Normal vector for offsetting tracks and curve control point
  const nx = dx / length;
  const ny = dy / length;
  const px = -ny;
  const py = nx;

  const curveStrength = 4;
  const trackOffset = 4;

  // Center path for sleepers
  const centerControlX = (edgeMidpoint.x + target.x) / 2 + px * curveStrength;
  const centerControlY = (edgeMidpoint.y + target.y) / 2 + py * curveStrength;
  const centerPath = `M ${edgeMidpoint.x} ${edgeMidpoint.y} Q ${centerControlX} ${centerControlY} ${target.x} ${target.y}`;

  // Left track path
  const leftStartX = edgeMidpoint.x - px * trackOffset;
  const leftStartY = edgeMidpoint.y - py * trackOffset;
  const leftTargetX = target.x - px * trackOffset;
  const leftTargetY = target.y - py * trackOffset;
  const leftControlX = (leftStartX + leftTargetX) / 2 + px * curveStrength;
  const leftControlY = (leftStartY + leftTargetY) / 2 + py * curveStrength;
  const leftPath = `M ${leftStartX} ${leftStartY} Q ${leftControlX} ${leftControlY} ${leftTargetX} ${leftTargetY}`;

  // Right track path
  const rightStartX = edgeMidpoint.x + px * trackOffset;
  const rightStartY = edgeMidpoint.y + py * trackOffset;
  const rightTargetX = target.x + px * trackOffset;
  const rightTargetY = target.y + py * trackOffset;
  const rightControlX = (rightStartX + rightTargetX) / 2 + px * curveStrength;
  const rightControlY = (rightStartY + rightTargetY) / 2 + py * curveStrength;
  const rightPath = `M ${rightStartX} ${rightStartY} Q ${rightControlX} ${rightControlY} ${rightTargetX} ${rightTargetY}`;

  return (
    <>
      <Wedge segmentIndex={props.segmentIndex} fill={TERRAIN_COLORS.pasture} />
      <g>
        {/* Sleepers */}
        <path
          d={centerPath}
          stroke="#4a4a4a"
          strokeWidth={14}
          strokeDasharray="4 8"
          fill="none"
          strokeLinecap="butt"
        />
        {/* Left Track */}
        <path
          d={leftPath}
          stroke={TERRAIN_COLORS.rail}
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
        />
        {/* Right Track */}
        <path
          d={rightPath}
          stroke={TERRAIN_COLORS.rail}
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
        />
      </g>
    </>
  );
}
