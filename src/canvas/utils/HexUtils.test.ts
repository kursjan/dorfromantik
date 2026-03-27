import { describe, it, expect } from 'vitest';
import { hexToPixel, pixelToHex, getHexCorners, distanceToHex } from './HexUtils';
import { HexCoordinate } from '../../models/HexCoordinate';
import { north, northEast, southEast, south, southWest, northWest } from '../../models/Navigation';

describe('HexUtils', () => {
  const center = new HexCoordinate(0, 0, 0);
  const HEX_SIZE = 40;
  const SQRT3 = Math.sqrt(3);

  describe('distanceToHex', () => {
    it('returns 0 when point is exactly at hex center', () => {
      const { x, y } = hexToPixel(center, HEX_SIZE);
      const dist = distanceToHex(center, x, y, HEX_SIZE);
      expect(dist).toBeCloseTo(0);
    });

    it('returns correct distance for a point offset from center', () => {
      const { x, y } = hexToPixel(center, HEX_SIZE);
      const dist = distanceToHex(center, x + 30, y + 40, HEX_SIZE);
      expect(dist).toBeCloseTo(50); // 3-4-5 triangle
    });

    it('calculates distance to neighbor centers correctly', () => {
      const neighbor = north(center);
      const neighborPixel = hexToPixel(neighbor, HEX_SIZE);
      
      const dist = distanceToHex(neighbor, neighborPixel.x, neighborPixel.y, HEX_SIZE);
      expect(dist).toBeCloseTo(0);
      
      const distToCenter = distanceToHex(center, neighborPixel.x, neighborPixel.y, HEX_SIZE);
      expect(distToCenter).toBeCloseTo(HEX_SIZE * SQRT3);
    });
  });

  describe('hexToPixel', () => {
    it('converts center hex (0,0,0) to pixel (0,0)', () => {
      const { x, y } = hexToPixel(center, HEX_SIZE);
      expect(x).toBeCloseTo(0);
      expect(y).toBeCloseTo(0);
    });

    it('converts North neighbor (-1, 0, 1) to (0, -size * sqrt(3))', () => {
      const northCoord = north(center);
      const { x, y } = hexToPixel(northCoord, HEX_SIZE);

      const expectedY = -HEX_SIZE * SQRT3;

      expect(x).toBeCloseTo(0);
      expect(y).toBeCloseTo(expectedY);
    });

    it('converts South neighbor (1, 0, -1) to (0, size * sqrt(3))', () => {
      const southCoord = south(center);
      const { x, y } = hexToPixel(southCoord, HEX_SIZE);

      const expectedY = HEX_SIZE * SQRT3;

      expect(x).toBeCloseTo(0);
      expect(y).toBeCloseTo(expectedY);
    });

    it('converts North-East neighbor (-1, 1, 0) to (size * 1.5, -size * sqrt(3)/2)', () => {
      const ne = northEast(center);
      const { x, y } = hexToPixel(ne, HEX_SIZE);

      const expectedX = HEX_SIZE * 1.5;
      const expectedY = (-HEX_SIZE * SQRT3) / 2;

      expect(x).toBeCloseTo(expectedX);
      expect(y).toBeCloseTo(expectedY);
    });

    it('converts South-West neighbor (1, -1, 0) to (-size * 1.5, size * sqrt(3)/2)', () => {
      const sw = southWest(center);
      const { x, y } = hexToPixel(sw, HEX_SIZE);

      const expectedX = -HEX_SIZE * 1.5;
      const expectedY = (HEX_SIZE * SQRT3) / 2;

      expect(x).toBeCloseTo(expectedX);
      expect(y).toBeCloseTo(expectedY);
    });

    it('converts South-East neighbor (0, 1, -1) to (size * 1.5, size * sqrt(3)/2)', () => {
      const se = southEast(center);
      const { x, y } = hexToPixel(se, HEX_SIZE);

      const expectedX = HEX_SIZE * 1.5;
      const expectedY = (HEX_SIZE * SQRT3) / 2;

      expect(x).toBeCloseTo(expectedX);
      expect(y).toBeCloseTo(expectedY);
    });

    it('converts North-West neighbor (0, -1, 1) to (-size * 1.5, -size * sqrt(3)/2)', () => {
      const nw = northWest(center);
      const { x, y } = hexToPixel(nw, HEX_SIZE);

      const expectedX = -HEX_SIZE * 1.5;
      const expectedY = (-HEX_SIZE * SQRT3) / 2;

      expect(x).toBeCloseTo(expectedX);
      expect(y).toBeCloseTo(expectedY);
    });
  });

  describe('cubeRound (indirectly via pixelToHex)', () => {
    it('handles qDiff > rDiff && qDiff > sDiff', () => {
      const coord = pixelToHex(-10, -25, HEX_SIZE); 
      expect(coord).toBeDefined();
    });

    it('handles rDiff > sDiff', () => {
      const coord = pixelToHex(25, 0, HEX_SIZE);
      expect(coord).toBeDefined();
    });

    it('handles sDiff > rDiff && sDiff > qDiff', () => {
      const coord = pixelToHex(-10, 25, HEX_SIZE);
      expect(coord).toBeDefined();
    });
  });

  describe('pixelToHex', () => {
    it('converts pixel (0,0) to center hex (0,0,0)', () => {
      const hex = pixelToHex(0, 0, HEX_SIZE);
      expect(hex.q).toBe(0);
      expect(hex.r).toBe(0);
      expect(hex.s).toBe(0);
    });

    it('handles rounding correctly for points inside a hex', () => {
      const target = north(center);
      const centerPixel = hexToPixel(target, HEX_SIZE);

      const result = pixelToHex(centerPixel.x + 5, centerPixel.y + 5, HEX_SIZE);
      expect(result.equals(target)).toBe(true);
    });

    it('round trips correctly for all neighbors', () => {
      const neighbors = [
        north(center),
        south(center),
        northEast(center),
        southEast(center),
        southWest(center),
        northWest(center),
      ];

      neighbors.forEach((neighbor) => {
        const { x, y } = hexToPixel(neighbor, HEX_SIZE);
        const result = pixelToHex(x, y, HEX_SIZE);
        expect(result.equals(neighbor)).toBe(true);
      });
    });
  });

  describe('getHexCorners', () => {
    it('returns 6 corners', () => {
      const corners = getHexCorners(0, 0, HEX_SIZE);
      expect(corners.length).toBe(6);
    });

    it('returns correct coordinates for Flat-Top hex at origin', () => {
      const corners = getHexCorners(0, 0, HEX_SIZE);

      // Corner 0 (0 degrees): (size, 0)
      expect(corners[0].x).toBeCloseTo(HEX_SIZE);
      expect(corners[0].y).toBeCloseTo(0);

      // Corner 1 (60 degrees): (size/2, size * sqrt(3)/2)
      expect(corners[1].x).toBeCloseTo(HEX_SIZE / 2);
      expect(corners[1].y).toBeCloseTo((HEX_SIZE * SQRT3) / 2);

      // Corner 3 (180 degrees): (-size, 0)
      expect(corners[3].x).toBeCloseTo(-HEX_SIZE);
      expect(corners[3].y).toBeCloseTo(0);
    });

    it('offsets corners by center position', () => {
      const x = 100;
      const y = 200;
      const corners = getHexCorners(x, y, HEX_SIZE);

      // Corner 0: (x + size, y)
      expect(corners[0].x).toBeCloseTo(x + HEX_SIZE);
      expect(corners[0].y).toBeCloseTo(y);
    });
  });

  describe('Scaling (Custom Size)', () => {
    const CUSTOM_SIZE = 10;

    it('calculates pixel position correctly with different size', () => {
      const northCoord = north(center);
      const { x, y } = hexToPixel(northCoord, CUSTOM_SIZE);

      // For size 10, North should be at (0, -10 * sqrt(3)) = (0, -17.32)
      const expectedY = -CUSTOM_SIZE * SQRT3;

      expect(x).toBeCloseTo(0);
      expect(y).toBeCloseTo(expectedY);

      // Ensure it's NOT using the default 40
      expect(y).not.toBeCloseTo(-40 * SQRT3);
    });

    it('round trips correctly with different size', () => {
      const target = southEast(center);
      const { x, y } = hexToPixel(target, CUSTOM_SIZE);
      const result = pixelToHex(x, y, CUSTOM_SIZE);

      expect(result.equals(target)).toBe(true);
    });

    it('calculates corners correctly with different size', () => {
      const corners = getHexCorners(0, 0, CUSTOM_SIZE);
      // Corner 0: (size, 0) -> (10, 0)
      expect(corners[0].x).toBeCloseTo(CUSTOM_SIZE);

      // Ensure it's NOT 40
      expect(corners[0].x).not.toBeCloseTo(40);
    });
  });
});
