import { describe, it, expect } from 'vitest';
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
  const origin = new HexCoordinate(0, 0, 0);
  const emptyBoard = (): Board => new Board();
  const boardWithTile = (): Board => Board.withTile(tile, origin);
  const tile = new Tile({
    id: 'test-tile',
    north: new TreeTerrain(),
    northEast: new HouseTerrain(),
    southEast: new WaterTerrain(),
    south: new PastureTerrain(),
    southWest: new RailTerrain(),
    northWest: new FieldTerrain(),
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
      expect(isPositionEmpty(emptyBoard(), origin)).toBe(true);
    });

    it('should return false if the coordinate has a tile', () => {
      expect(isPositionEmpty(boardWithTile(), origin)).toBe(false);
    });
  });

  describe('hasAdjacentTile', () => {
    it('should return false for an empty board', () => {
      expect(hasAdjacentTile(emptyBoard(), origin)).toBe(false);
    });

    it('should return true if there is an adjacent tile', () => {
      const board = boardWithTile();
      const neighborCoord = north(origin);
      expect(hasAdjacentTile(board, neighborCoord)).toBe(true);
    });

    it('should return false if tiles are far away', () => {
      const board = boardWithTile();
      const farCoord = north(north(origin));
      expect(hasAdjacentTile(board, farCoord)).toBe(false);
    });
  });

  describe('doStrictEdgesMatch', () => {
    it('should return true when a non-strict edge touches a non-strict edge', () => {
      const board = boardWithTile();
      const neighborCoord = north(origin);
      const testTile = new Tile({ south: new FieldTerrain() });
      expect(doStrictEdgesMatch(board, neighborCoord, testTile)).toBe(true);
    });

    it('should return false when a strict edge touches a mismatching non-strict edge', () => {
      const board = boardWithTile();
      const seCoord = southEast(origin);
      const testTile = new Tile({ northWest: new FieldTerrain() });
      expect(doStrictEdgesMatch(board, seCoord, testTile)).toBe(false);
    });

    it('should return true when a strict edge touches a matching strict edge', () => {
      const board = boardWithTile();
      const seCoord = southEast(origin);
      const testTile = new Tile({ northWest: new WaterTerrain() });
      const result = doStrictEdgesMatch(board, seCoord, testTile);
      expect(result).toBe(true);
    });

    it('should handle hybrid waterOrPasture terrain correctly', () => {
      // Arrange
      const board = boardWithTile();
      const seCoord = southEast(origin);
      const hybridTile = new Tile({ northWest: new WaterOrPastureTerrain() });
      const sCoord = south(origin);
      const hybridTile2 = new Tile({ north: new WaterOrPastureTerrain() });
      const nCoord = north(origin);
      const hybridTile3 = new Tile({ south: new WaterOrPastureTerrain() });

      expect(doStrictEdgesMatch(board, seCoord, hybridTile)).toBe(true);
      expect(doStrictEdgesMatch(board, sCoord, hybridTile2)).toBe(true);
      expect(doStrictEdgesMatch(board, nCoord, hybridTile3)).toBe(false);
    });
  });

  describe('isValidPlacement', () => {
    it('should return false if board is empty', () => {
      const board = emptyBoard();
      expect(isValidPlacement(board, origin, tile)).toBe(false);
    });

    it('should return true if adjacent tile exists and no strict mismatches', () => {
      const board = boardWithTile();
      const neighborCoord = north(origin);
      const validTile = new Tile({ south: new FieldTerrain() });
      expect(isValidPlacement(board, neighborCoord, validTile)).toBe(true);
    });

    it('should return false if spot is occupied', () => {
      const board = boardWithTile();
      expect(isValidPlacement(board, origin, tile)).toBe(false);
    });

    it('should return false if only far away tiles exist', () => {
      const board = boardWithTile();
      const farCoord = north(north(origin));
      expect(isValidPlacement(board, farCoord, tile)).toBe(false);
    });

    it('should return false if placing water next to non-water', () => {
      const board = boardWithTile();
      const seCoord = southEast(origin);
      const fieldTile = new Tile({ northWest: new FieldTerrain() });
      expect(isValidPlacement(board, seCoord, fieldTile)).toBe(false);
    });
  });
});
