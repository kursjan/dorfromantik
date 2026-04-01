import { HexCoordinate } from '../../models/HexCoordinate';
import { directions } from '../../models/Navigation';

/** Vertex radius for flat-top hex geometry in SVG user units (shared by wedge paths and edge-midpoint math). */
export const SVG_HEX_RADIUS = 50;
const SVG_CENTER_WATER_HEX_RADIUS = SVG_HEX_RADIUS * 0.35;
const SVG_CENTER_RAIL_HEX_RADIUS = SVG_HEX_RADIUS * 0.15;

/**
 * Converts a logical HexCoordinate to absolute pixel coordinates (x, y)
 * based on the standard SVG_HEX_RADIUS.
 */
export function hexToPixel(hex: HexCoordinate): { x: number; y: number } {
  // Flat-topped hex conversion
  // Adjusted for user coordinate system where (-1, 0, 1) is North.
  // We swap q and r in the standard flat-topped formula.
  const effectiveQ = hex.r;
  const effectiveR = hex.q;

  const x = SVG_HEX_RADIUS * (3.0 / 2.0) * effectiveQ;
  const y = SVG_HEX_RADIUS * ((Math.sqrt(3.0) / 2.0) * effectiveQ + Math.sqrt(3.0) * effectiveR);
  return { x, y };
}

interface Point {
  x: number;
  y: number;
}

function formatNumber(value: number): string {
  const rounded = Number(value.toFixed(3));
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

function toPoint(point: Point): string {
  return `${formatNumber(point.x)} ${formatNumber(point.y)}`;
}

function buildHexCorners(radius: number): Point[] {
  return Array.from({ length: 6 }, (_, index) => {
    const angle = (Math.PI / 180) * 60 * index;
    return {
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle),
    };
  });
}

/** Corner points in direction order (north vertex index 0, then clockwise). */
export const SVG_HEX_CORNER_POINTS = buildHexCorners(SVG_HEX_RADIUS);

function buildWedgePath(segmentIndex: number): string {
  const startCorner = SVG_HEX_CORNER_POINTS[(segmentIndex + 4) % 6];
  const endCorner = SVG_HEX_CORNER_POINTS[(segmentIndex + 5) % 6];
  return `M 0 0 L ${toPoint(startCorner)} L ${toPoint(endCorner)} Z`;
}

function buildCenterHexPath(radius: number): string {
  const corners = buildHexCorners(radius);
  return `M ${toPoint(corners[0])} L ${toPoint(corners[1])} L ${toPoint(corners[2])} L ${toPoint(
    corners[3]
  )} L ${toPoint(corners[4])} L ${toPoint(corners[5])} Z`;
}

/** Wedge paths in canonical direction order: north, northEast, southEast, south, southWest, northWest. */
export const SVG_HEX_WEDGE_PATHS = directions.map((_, segmentIndex) =>
  buildWedgePath(segmentIndex)
);

/** Center hex path for water center terrain. */
export const SVG_HEX_CENTER_WATER_PATH = buildCenterHexPath(SVG_CENTER_WATER_HEX_RADIUS);

/** Center hex path for rail center terrain. */
export const SVG_HEX_CENTER_RAIL_PATH = buildCenterHexPath(SVG_CENTER_RAIL_HEX_RADIUS);
