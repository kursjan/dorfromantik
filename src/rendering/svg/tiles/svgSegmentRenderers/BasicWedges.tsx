import type { ReactElement } from 'react';
import { TERRAIN_COLORS } from '../../../common/hex/terrainPalette';
import { Wedge } from '../Wedge';
import type { SvgWedgeSegmentRendererProps } from './types';
import { renderWaterWedge } from './WaterWedge';

export function renderTreeWedge(props: SvgWedgeSegmentRendererProps): ReactElement {
  return <Wedge segmentIndex={props.segmentIndex} fill={TERRAIN_COLORS.tree} />;
}

export function renderHouseWedge(props: SvgWedgeSegmentRendererProps): ReactElement {
  return <Wedge segmentIndex={props.segmentIndex} fill={TERRAIN_COLORS.house} />;
}

export function renderPastureWedge(props: SvgWedgeSegmentRendererProps): ReactElement {
  return <Wedge segmentIndex={props.segmentIndex} fill={TERRAIN_COLORS.pasture} />;
}

export function renderFieldWedge(props: SvgWedgeSegmentRendererProps): ReactElement {
  return <Wedge segmentIndex={props.segmentIndex} fill={TERRAIN_COLORS.field} />;
}

export function renderWaterOrPastureWedge(props: SvgWedgeSegmentRendererProps): ReactElement {
  if (props.neighborEdgeTerrainType === 'water') {
    return renderWaterWedge(props);
  }

  return <Wedge segmentIndex={props.segmentIndex} fill={TERRAIN_COLORS.pasture} />;
}
