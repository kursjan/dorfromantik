import type { ReactElement } from 'react';
import { TERRAIN_COLORS } from '../../../common/hex/terrainPalette';
import { Wedge } from '../Wedge';
import type { SvgWedgeSegmentRendererProps } from './types';
import { getEdgeMidpoint, isLinkedToCenter } from './utils';

export function renderWaterWedge(props: SvgWedgeSegmentRendererProps): ReactElement {
  const edgeMidpoint = getEdgeMidpoint(props.segmentIndex);
  const target = isLinkedToCenter(props.terrain)
    ? { x: 0, y: 0 }
    : { x: edgeMidpoint.x / 2, y: edgeMidpoint.y / 2 };
  const dx = target.x - edgeMidpoint.x;
  const dy = target.y - edgeMidpoint.y;
  const length = Math.hypot(dx, dy) || 1;
  const curveStrength = 4;
  const controlX = (edgeMidpoint.x + target.x) / 2 + (-dy / length) * curveStrength;
  const controlY = (edgeMidpoint.y + target.y) / 2 + (dx / length) * curveStrength;

  return (
    <>
      <Wedge segmentIndex={props.segmentIndex} fill={TERRAIN_COLORS.pasture} />
      <path
        d={`M ${edgeMidpoint.x} ${edgeMidpoint.y} Q ${controlX} ${controlY} ${target.x} ${target.y}`}
        stroke={TERRAIN_COLORS.water}
        strokeWidth={12}
        fill="none"
        strokeLinecap="round"
      />
    </>
  );
}
