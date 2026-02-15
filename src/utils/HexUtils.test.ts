import { describe, it, expect } from 'vitest';
import { hexToPixel, pixelToHex, HEX_SIZE } from './HexUtils';
import { HexCoordinate } from '../models/HexCoordinate';

describe('HexUtils', () => {
  describe('hexToPixel', () => {
    it('should convert center hex (0,0,0) to pixel (0,0)', () => {
      expect(hexToPixel(0, 0, HEX_SIZE)).toEqual({ x: 0, y: 0 });
    });

    it('should calculate coordinates for neighbor (1, 0, -1)', () => {
      const { x, y } = hexToPixel(1, 0, HEX_SIZE);
      const expectedX = HEX_SIZE * 1.5;
      const expectedY = HEX_SIZE * Math.sqrt(3) * 0.5;
      expect(x).toBeCloseTo(expectedX);
      expect(y).toBeCloseTo(expectedY);
    });
  });

  describe('pixelToHex', () => {
    it('should convert pixel (0,0) to center hex (0,0,0)', () => {
      expect(pixelToHex(0, 0, HEX_SIZE)).toEqual(new HexCoordinate(0, 0, 0));
    });

    it('should convert pixel near neighbor (1, 0, -1) back to hex', () => {
      const { x, y } = hexToPixel(1, 0, HEX_SIZE);
      // Small offset should still round to the same hex
      expect(pixelToHex(x + 1, y + 1, HEX_SIZE)).toEqual(new HexCoordinate(1, 0, -1));
    });
  });
});
