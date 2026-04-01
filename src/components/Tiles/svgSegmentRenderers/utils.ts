import { Terrain, WaterTerrain, RailTerrain } from '../../../models/Terrain';

/** Distance from hex center to each vertex (SVG user units); matches `HexTile` viewBox half-width. */
const HEX_VERTEX_RADIUS = 50;

/** Degrees between adjacent hex vertices (360° / 6). */
const DEGREES_PER_HEX_VERTEX = 60;

const HEX_VERTEX_COUNT = 6;

/**
 * Offsets from `segmentIndex` to the two vertex indices that bound that wedge edge.
 * Must stay aligned with wedge path segment order in `SvgHexUtils` / `HexTile`.
 */
const SEGMENT_START_CORNER_OFFSET = 4;
const SEGMENT_END_CORNER_OFFSET = 5;

export function isLinkedToCenter(terrain: Terrain | undefined): boolean {
  if (terrain instanceof WaterTerrain) return terrain.linkToCenter;
  if (terrain instanceof RailTerrain) return terrain.linkToCenter;
  return false;
}

export function getCorner(index: number): { x: number; y: number } {
  const angle = (Math.PI / 180) * DEGREES_PER_HEX_VERTEX * index;
  return {
    x: HEX_VERTEX_RADIUS * Math.cos(angle),
    y: HEX_VERTEX_RADIUS * Math.sin(angle),
  };
}

export function getEdgeMidpoint(segmentIndex: number): { x: number; y: number } {
  const startCorner = getCorner((segmentIndex + SEGMENT_START_CORNER_OFFSET) % HEX_VERTEX_COUNT);
  const endCorner = getCorner((segmentIndex + SEGMENT_END_CORNER_OFFSET) % HEX_VERTEX_COUNT);
  return {
    x: (startCorner.x + endCorner.x) / 2,
    y: (startCorner.y + endCorner.y) / 2,
  };
}
