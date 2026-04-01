import type { ReactElement } from 'react';
import { type TerrainId, type TerrainType } from '../../models/Terrain';
import type { Direction } from '../../models/Navigation';
import { TERRAIN_COLORS } from '../../canvas/graphics/HexStyles';
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

function renderTreeWedge(props: SvgWedgeSegmentRendererProps): ReactElement {
  return <Wedge segmentIndex={props.segmentIndex} fill={TERRAIN_COLORS.tree} />;
}

function renderHouseWedge(props: SvgWedgeSegmentRendererProps): ReactElement {
  return <Wedge segmentIndex={props.segmentIndex} fill={TERRAIN_COLORS.house} />;
}

function renderWaterWedge(props: SvgWedgeSegmentRendererProps): ReactElement {
  return <Wedge segmentIndex={props.segmentIndex} fill={TERRAIN_COLORS.water} />;
}

function renderPastureWedge(props: SvgWedgeSegmentRendererProps): ReactElement {
  return <Wedge segmentIndex={props.segmentIndex} fill={TERRAIN_COLORS.pasture} />;
}

function renderRailWedge(props: SvgWedgeSegmentRendererProps): ReactElement {
  return <Wedge segmentIndex={props.segmentIndex} fill={TERRAIN_COLORS.rail} />;
}

function renderFieldWedge(props: SvgWedgeSegmentRendererProps): ReactElement {
  return <Wedge segmentIndex={props.segmentIndex} fill={TERRAIN_COLORS.field} />;
}

function renderWaterOrPastureWedge(props: SvgWedgeSegmentRendererProps): ReactElement {
  return <Wedge segmentIndex={props.segmentIndex} fill={TERRAIN_COLORS.pasture} />;
}

export const TERRAIN_ID_SVG_SEGMENT_RENDERERS: TerrainIdSvgSegmentRenderers = {
  wedge: {
    tree: renderTreeWedge,
    house: renderHouseWedge,
    water: renderWaterWedge,
    pasture: renderPastureWedge,
    rail: renderRailWedge,
    field: renderFieldWedge,
    waterOrPasture: renderWaterOrPastureWedge,
  },
  center: {
    water: () => <CenterWedge />,
    rail: () => <CenterWedge />,
  },
};
