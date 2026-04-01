import { describe, expect, it } from 'vitest';
import { SVG_HEX_CENTER_CIRCLE_PATH, SVG_HEX_WEDGE_PATHS } from './SvgHexUtils';

describe('SvgHexUtils', () => {
  it('exports six wedge paths', () => {
    expect(SVG_HEX_WEDGE_PATHS).toHaveLength(6);
  });

  it('uses the expected north wedge geometry', () => {
    expect(SVG_HEX_WEDGE_PATHS[0]).toBe('M 0 0 L -25 -43.301 L 25 -43.301 Z');
  });

  it('exports a closed center circle path', () => {
    expect(SVG_HEX_CENTER_CIRCLE_PATH).toBe('M 18 0 A 18 18 0 1 0 -18 0 A 18 18 0 1 0 18 0 Z');
  });
});
