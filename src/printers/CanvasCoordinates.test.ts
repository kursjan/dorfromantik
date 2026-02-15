import { describe, it, expect } from 'vitest';
import { HexCoordinate } from '../models/HexCoordinate';
import { CanvasCoordinates } from './CanvasCoordinates';

describe('CanvasCoordinates', () => {
  describe('getTileCoordinates', () => {
    it('should calculate coordinates for (0,0,0)', () => {
      expect(CanvasCoordinates.getTileCoordinates(new HexCoordinate(0, 0, 0))).toEqual({ x: 0, y: 0 });
    });

    it('should calculate coordinates for South (1,0,-1)', () => {
      expect(CanvasCoordinates.getTileCoordinates(new HexCoordinate(1, 0, -1))).toEqual({ x: 0, y: 4 });
    });

    it('should calculate coordinates for SouthEast (0,1,-1)', () => {
      expect(CanvasCoordinates.getTileCoordinates(new HexCoordinate(0, 1, -1))).toEqual({ x: 7, y: 2 });
    });

    it('should calculate coordinates for North (-1,0,1)', () => {
      expect(CanvasCoordinates.getTileCoordinates(new HexCoordinate(-1, 0, 1))).toEqual({ x: 0, y: -4 });
    });
  });
});
