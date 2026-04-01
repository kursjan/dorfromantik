import type { ReactElement } from 'react';
import type { Terrain, TerrainId, TerrainType } from '../../../models/Terrain';
import type { Direction } from '../../../models/Navigation';

export interface SvgWedgeSegmentRendererProps {
  terrainId: TerrainId;
  segmentIndex: number;
  direction: Direction;
  neighborEdgeTerrainType?: TerrainType;
  terrain?: Terrain;
}

export interface SvgCenterSegmentRendererProps {
  terrainId: TerrainId;
}

export interface TerrainIdSvgSegmentRenderers {
  wedge: Record<TerrainId, (props: SvgWedgeSegmentRendererProps) => ReactElement>;
  center: Partial<Record<TerrainId, (props: SvgCenterSegmentRendererProps) => ReactElement>>;
}
