import { HexCoordinate } from '../models/HexCoordinate';

export const HEX_SIZE = 40; // Pixel radius of the hex

export function hexToPixel(q: number, r: number, size: number = HEX_SIZE): { x: number; y: number } {
  const x = size * (3 / 2) * q;
  const y = size * Math.sqrt(3) * (r + q / 2);
  return { x, y };
}

export function pixelToHex(x: number, y: number, size: number = HEX_SIZE): HexCoordinate {
  const q = ((2 / 3) * x) / size;
  const r = ((-1 / 3) * x + (Math.sqrt(3) / 3) * y) / size;
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
