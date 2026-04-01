import type { ReactElement } from 'react';
import { TERRAIN_IDS, type TerrainId, type TerrainType } from '../../models/Terrain';
import type { Direction } from '../../models/Navigation';
import { CenterWedge } from './CenterWedge';
import { Wedge } from './Wedge';

export interface SvgWedgeSegmentRendererProps {
  terrainId: TerrainId;
  segmentIndex: number;
  direction: Direction;
  neighborEdgeTerrainType?: TerrainType;
}

export interface SvgCenterSegmentRendererProps {
  terrainId: TerrainId;
}

export interface TerrainIdSvgSegmentRenderers {
  wedge: Record<TerrainId, (props: SvgWedgeSegmentRendererProps) => ReactElement>;
  center: Partial<Record<TerrainId, (props: SvgCenterSegmentRendererProps) => ReactElement>>;
}

function renderBaseWedge(props: SvgWedgeSegmentRendererProps): ReactElement {
  return <Wedge segmentIndex={props.segmentIndex} />;
}

export const TERRAIN_ID_SVG_SEGMENT_RENDERERS: TerrainIdSvgSegmentRenderers = {
  wedge: Object.fromEntries(TERRAIN_IDS.map((terrainId) => [terrainId, renderBaseWedge])) as Record<
    TerrainId,
    (props: SvgWedgeSegmentRendererProps) => ReactElement
  >,
  center: {
    water: () => <CenterWedge />,
    rail: () => <CenterWedge />,
  },
};
