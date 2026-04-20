import { Terrain, WaterTerrain, RailTerrain } from '../../../../models/Terrain';
import { SVG_HEX_CORNER_POINTS } from '../SvgHexUtils';

const HEX_VERTEX_COUNT = 6;

/**
 * Offsets from `segmentIndex` to the two vertex indices that bound that wedge edge.
 * Must stay aligned with wedge path segment order in `SvgHexUtils`.
 */
const SEGMENT_START_CORNER_OFFSET = 4;
const SEGMENT_END_CORNER_OFFSET = 5;

export function isLinkedToCenter(terrain: Terrain | undefined): boolean {
  if (terrain instanceof WaterTerrain) return terrain.linkToCenter;
  if (terrain instanceof RailTerrain) return terrain.linkToCenter;
  return false;
}

export function getCorner(index: number): { x: number; y: number } {
  return SVG_HEX_CORNER_POINTS[index % HEX_VERTEX_COUNT];
}

export function getEdgeMidpoint(segmentIndex: number): { x: number; y: number } {
  const startCorner =
    SVG_HEX_CORNER_POINTS[(segmentIndex + SEGMENT_START_CORNER_OFFSET) % HEX_VERTEX_COUNT];
  const endCorner =
    SVG_HEX_CORNER_POINTS[(segmentIndex + SEGMENT_END_CORNER_OFFSET) % HEX_VERTEX_COUNT];
  return {
    x: (startCorner.x + endCorner.x) / 2,
    y: (startCorner.y + endCorner.y) / 2,
  };
}
