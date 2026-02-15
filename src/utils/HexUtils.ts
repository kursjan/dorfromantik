import { HexCoordinate } from '../models/HexCoordinate';

export const HEX_SIZE = 40; // Pixel radius of the hex

export function hexToPixel(q: number, r: number, size: number = HEX_SIZE): { x: number; y: number } {
  // Flat-topped hex conversion
  // Adjusted for user coordinate system where (-1, 0, 1) is North.
  // We swap q and r in the standard flat-topped formula.
  // Standard (q, r) -> x depends on q.
  // Here x depends on r.
  
  const effectiveQ = r;
  const effectiveR = q;

  const x = size * (3.0 / 2.0) * effectiveQ;
  const y = size * (Math.sqrt(3.0) / 2.0 * effectiveQ + Math.sqrt(3.0) * effectiveR);
  return { x, y };
}

export function pixelToHex(x: number, y: number, size: number = HEX_SIZE): HexCoordinate {
  // Inverse flat-topped hex conversion
  // Adjusted for user coordinate system where (-1, 0, 1) is North.
  // We swap the result assignments compared to standard formula.

  // Standard: q = (2/3 x) / size
  // Standard: r = (-1/3 x + sqrt(3)/3 y) / size
  
  // Here:
  // effectiveQ = r_new = (2/3 x) / size
  // effectiveR = q_new = (-1/3 x + sqrt(3)/3 y) / size

  const r = (2.0 / 3.0 * x) / size;
  const q = (-1.0 / 3.0 * x + Math.sqrt(3.0) / 3.0 * y) / size;
  const s = -q - r;
  return cubeRound(q, r, s);
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
