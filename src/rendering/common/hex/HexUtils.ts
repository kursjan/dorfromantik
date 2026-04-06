import { HexCoordinate } from '../../../models/HexCoordinate';
import { WorldPoint } from '../WorldPoint';

export function hexToPixel(hex: HexCoordinate, size: number): WorldPoint {
  // Flat-topped hex conversion
  // Adjusted for user coordinate system where (-1, 0, 1) is North.
  // We swap q and r in the standard flat-topped formula.

  const effectiveQ = hex.r;
  const effectiveR = hex.q;

  const x = size * (3.0 / 2.0) * effectiveQ;
  const y = size * ((Math.sqrt(3.0) / 2.0) * effectiveQ + Math.sqrt(3.0) * effectiveR);
  return WorldPoint.xy(x, y);
}

export function distanceToHex(hex: HexCoordinate, point: WorldPoint, hexSize: number): number {
  const center = hexToPixel(hex, hexSize);
  const dx = center.x - point.x;
  const dy = center.y - point.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Coordinate in `candidates` whose hex center is closest to `world`.
 * Requires `candidates.length > 0` (callers must guard empty lists).
 */
export function closestHexByWorldDistance(
  candidates: readonly HexCoordinate[],
  point: WorldPoint,
  hexSize: number
): HexCoordinate {
  return candidates
    .map((coord) => ({ coord, dist: distanceToHex(coord, point, hexSize) }))
    .sort((a, b) => a.dist - b.dist)[0].coord;
}

/** Inverse of {@link hexToPixel}; `world` is the same {@link WorldPoint} plane. */
export function pixelToHex(point: WorldPoint, size: number): HexCoordinate {
  // Inverse flat-topped hex conversion
  // Adjusted for user coordinate system where (-1, 0, 1) is North.

  const r = ((2.0 / 3.0) * point.x) / size;
  const q = ((-1.0 / 3.0) * point.x + (Math.sqrt(3.0) / 3.0) * point.y) / size;
  const s = -q - r;
  return cubeRound(q, r, s);
}

/**
 * Returns the 6 corner points of a flat-top hex around `center`.
 * Corners are at 0°, 60°, …, 300° from +x.
 */
export function getHexCorners(center: WorldPoint, size: number): WorldPoint[] {
  const corners: WorldPoint[] = [];
  for (let i = 0; i < 6; i++) {
    const angle_deg = 60 * i;
    const angle_rad = (Math.PI / 180) * angle_deg;
    corners.push(
      WorldPoint.xy(center.x + size * Math.cos(angle_rad), center.y + size * Math.sin(angle_rad))
    );
  }
  return corners;
}

function cubeRound(fracQ: number, fracR: number, fracS: number): HexCoordinate {
  let q = Math.round(fracQ);
  let r = Math.round(fracR);
  let s = Math.round(fracS);

  const qDiff = Math.abs(q - fracQ);
  const rDiff = Math.abs(r - fracR);
  const sDiff = Math.abs(s - fracS);

  if (qDiff > rDiff && qDiff > sDiff) {
    q = -r - s;
  } else if (rDiff > sDiff) {
    r = -q - s;
  } else {
    s = -q - r;
  }

  return new HexCoordinate(q, r, s);
}
