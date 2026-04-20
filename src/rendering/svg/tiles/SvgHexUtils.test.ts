import { describe, expect, it } from 'vitest';
import { hexToPixel as canvasHexToPixel } from '../../common/hex/HexUtils';
import { HexCoordinate } from '../../../models/HexCoordinate';
import { SVG_HEX_RADIUS, hexToPixel } from './SvgHexUtils';

describe('SvgHexUtils.hexToPixel', () => {
  it('matches canvas HexUtils at origin', () => {
    const c = new HexCoordinate(0, 0, 0);
    expect(hexToPixel(c)).toEqual(canvasHexToPixel(c, SVG_HEX_RADIUS));
  });

  it('matches canvas HexUtils at (1,-1,0)', () => {
    const c = new HexCoordinate(1, -1, 0);
    expect(hexToPixel(c)).toEqual(canvasHexToPixel(c, SVG_HEX_RADIUS));
  });

  it('matches canvas HexUtils at (-2,1,1)', () => {
    const c = new HexCoordinate(-2, 1, 1);
    expect(hexToPixel(c)).toEqual(canvasHexToPixel(c, SVG_HEX_RADIUS));
  });
});
