import { HexCoordinate } from '../../models/HexCoordinate';

export function hexToPixel(hex: HexCoordinate, size: number): { x: number; y: number } {
  // Flat-topped hex conversion
  // Adjusted for user coordinate system where (-1, 0, 1) is North.
  // We swap q and r in the standard flat-topped formula.
  
  const effectiveQ = hex.r;
  const effectiveR = hex.q;

  const x = size * (3.0 / 2.0) * effectiveQ;
  const y = size * (Math.sqrt(3.0) / 2.0 * effectiveQ + Math.sqrt(3.0) * effectiveR);
  return { x, y };
}

export function pixelToHex(x: number, y: number, size: number): HexCoordinate {
  // Inverse flat-topped hex conversion
  // Adjusted for user coordinate system where (-1, 0, 1) is North.

  const r = (2.0 / 3.0 * x) / size;
  const q = (-1.0 / 3.0 * x + Math.sqrt(3.0) / 3.0 * y) / size;
  const s = -q - r;
  return cubeRound(q, r, s);
}

/**
 * Returns the 6 corner points of a hex relative to its center (x, y).
 * For Flat-Top orientation, corners are at 0°, 60°, 120°, 180°, 240°, 300°.
 */
export function getHexCorners(x: number, y: number, size: number): { x: number, y: number }[] {
  const corners: { x: number, y: number }[] = [];
  for (let i = 0; i < 6; i++) {
    const angle_deg = 60 * i;
    const angle_rad = Math.PI / 180 * angle_deg;
    corners.push({
      x: x + size * Math.cos(angle_rad),
      y: y + size * Math.sin(angle_rad)
    });
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
