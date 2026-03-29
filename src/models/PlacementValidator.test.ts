import { describe, it, expect, beforeEach } from 'vitest';
import { Board } from './Board';
import { Tile } from './Tile';
import { HexCoordinate } from './HexCoordinate';
import { north, southEast, south } from './Navigation';
import {
  isStrict,
  isPositionEmpty,
  hasAdjacentTile,
  doStrictEdgesMatch,
  isValidPlacement,
} from './PlacementValidator';
import {
  FieldTerrain,
  HouseTerrain,
  PastureTerrain,
  RailTerrain,
  TreeTerrain,
  WaterTerrain,
  WaterOrPastureTerrain,
} from './Terrain';

describe('PlacementValidator', () => {
  let board: Board;
  const origin = new HexCoordinate(0, 0, 0);

  const tile = new Tile({
    id: 'test-tile',
    north: new TreeTerrain(),
    northEast: new HouseTerrain(),
    southEast: new WaterTerrain(),
    south: new PastureTerrain(),
    southWest: new RailTerrain(),
    northWest: new FieldTerrain(),
  });

  beforeEach(() => {
    board = new Board();
  });

  describe('isStrict', () => {
    it('should return true for strict terrains', () => {
      expect(isStrict(new WaterTerrain())).toBe(true);
      expect(isStrict(new RailTerrain())).toBe(true);
      expect(isStrict(new WaterOrPastureTerrain())).toBe(true);
    });

    it('should return false for non-strict terrains', () => {
      expect(isStrict(new FieldTerrain())).toBe(false);
      expect(isStrict(new HouseTerrain())).toBe(false);
      expect(isStrict(new PastureTerrain())).toBe(false);
      expect(isStrict(new TreeTerrain())).toBe(false);
    });
  });

  describe('isPositionEmpty', () => {
    it('should return true if the coordinate has no tile', () => {
      expect(isPositionEmpty(board, origin)).toBe(true);
    });

    it('should return false if the coordinate has a tile', () => {
      const { board: b1 } = board.place(tile, origin);
      expect(isPositionEmpty(b1, origin)).toBe(false);
    });
  });

  describe('hasAdjacentTile', () => {
    it('should return false for an empty board', () => {
      expect(hasAdjacentTile(board, origin)).toBe(false);
    });

    it('should return true if there is an adjacent tile', () => {
      const { board: b1 } = board.place(tile, origin);
      const neighborCoord = north(origin);
      expect(hasAdjacentTile(b1, neighborCoord)).toBe(true);
    });

    it('should return false if tiles are far away', () => {
      const { board: b1 } = board.place(tile, origin);
      const farCoord = north(north(origin));
      expect(hasAdjacentTile(b1, farCoord)).toBe(false);
    });
  });

  describe('doStrictEdgesMatch', () => {
    let boardWithTile: Board;
    beforeEach(() => {
      const { board: b1 } = board.place(tile, origin);
      boardWithTile = b1;
    });

    it('should return true when a non-strict edge touches a non-strict edge', () => {
      const neighborCoord = north(origin);
      const testTile = new Tile({ south: new FieldTerrain() });
      expect(doStrictEdgesMatch(boardWithTile, neighborCoord, testTile)).toBe(true);
    });

    it('should return false when a strict edge touches a mismatching non-strict edge', () => {
      const seCoord = southEast(origin);
      const testTile = new Tile({ northWest: new FieldTerrain() });
      expect(doStrictEdgesMatch(boardWithTile, seCoord, testTile)).toBe(false);
    });

    it('should return true when a strict edge touches a matching strict edge', () => {
      const seCoord = southEast(origin);
      const testTile = new Tile({ northWest: new WaterTerrain() });
      expect(doStrictEdgesMatch(boardWithTile, seCoord, testTile)).toBe(true);
    });

    it('should handle hybrid waterOrPasture terrain correctly', () => {
      const seCoord = southEast(origin);

      const hybridTile = new Tile({ northWest: new WaterOrPastureTerrain() });
      expect(doStrictEdgesMatch(boardWithTile, seCoord, hybridTile)).toBe(true);

      const sCoord = south(origin);

      const hybridTile2 = new Tile({ north: new WaterOrPastureTerrain() });
      expect(doStrictEdgesMatch(boardWithTile, sCoord, hybridTile2)).toBe(true);

      const nCoord = north(origin);

      const hybridTile3 = new Tile({ south: new WaterOrPastureTerrain() });
      expect(doStrictEdgesMatch(boardWithTile, nCoord, hybridTile3)).toBe(false);
    });
  });

  describe('isValidPlacement', () => {
    it('should return false if board is empty', () => {
      expect(isValidPlacement(board, origin, tile)).toBe(false);
    });

    it('should return true if adjacent tile exists and no strict mismatches', () => {
      const { board: b1 } = board.place(tile, origin);

      const neighborCoord = north(origin);
      const validTile = new Tile({ south: new FieldTerrain() });
      expect(isValidPlacement(b1, neighborCoord, validTile)).toBe(true);
    });

    it('should return false if spot is occupied', () => {
      const { board: b1 } = board.place(tile, origin);
      expect(isValidPlacement(b1, origin, tile)).toBe(false);
    });

    it('should return false if only far away tiles exist', () => {
      const { board: b1 } = board.place(tile, origin);

      const farCoord = north(north(origin));
      expect(isValidPlacement(b1, farCoord, tile)).toBe(false);
    });

    it('should return false if placing water next to non-water', () => {
      const { board: b1 } = board.place(tile, origin);

      const seCoord = southEast(origin);
      const fieldTile = new Tile({ northWest: new FieldTerrain() });
      expect(isValidPlacement(b1, seCoord, fieldTile)).toBe(false);
    });
  });
});
