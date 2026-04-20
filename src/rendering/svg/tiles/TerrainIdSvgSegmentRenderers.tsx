import { TERRAIN_COLORS } from '../../common/hex/terrainPalette';
import { CenterWedge } from './CenterWedge';
import { SVG_HEX_CENTER_RAIL_PATH, SVG_HEX_CENTER_WATER_PATH } from './SvgHexUtils';
import type { TerrainIdSvgSegmentRenderers } from './svgSegmentRenderers/types';
import {
  renderTreeWedge,
  renderHouseWedge,
  renderPastureWedge,
  renderFieldWedge,
  renderWaterOrPastureWedge,
} from './svgSegmentRenderers/BasicWedges';
import { renderWaterWedge } from './svgSegmentRenderers/WaterWedge';
import { renderRailWedge } from './svgSegmentRenderers/RailWedge';

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
    water: () => <CenterWedge d={SVG_HEX_CENTER_WATER_PATH} fill={TERRAIN_COLORS.water} />,
    rail: () => <CenterWedge d={SVG_HEX_CENTER_RAIL_PATH} fill={TERRAIN_COLORS.rail} />,
  },
};
