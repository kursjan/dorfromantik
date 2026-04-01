import { describe, expect, it } from 'vitest';
import {
  SVG_HEX_CENTER_RAIL_PATH,
  SVG_HEX_CENTER_WATER_PATH,
  SVG_HEX_WEDGE_PATHS,
} from './SvgHexUtils';

describe('SvgHexUtils', () => {
  it('exports six wedge paths', () => {
    expect(SVG_HEX_WEDGE_PATHS).toHaveLength(6);
  });

  it('uses the expected north wedge geometry', () => {
    expect(SVG_HEX_WEDGE_PATHS[0]).toBe('M 0 0 L -25 -43.301 L 25 -43.301 Z');
  });

  it('exports a water center hex path matching canvas center scale', () => {
    expect(SVG_HEX_CENTER_WATER_PATH).toBe(
      'M 17.5 0 L 8.75 15.155 L -8.75 15.155 L -17.5 0 L -8.75 -15.155 L 8.75 -15.155 Z'
    );
  });

  it('exports a rail center hex path matching canvas center scale', () => {
    expect(SVG_HEX_CENTER_RAIL_PATH).toBe(
      'M 7.5 0 L 3.75 6.495 L -3.75 6.495 L -7.5 0 L -3.75 -6.495 L 3.75 -6.495 Z'
    );
  });
});
