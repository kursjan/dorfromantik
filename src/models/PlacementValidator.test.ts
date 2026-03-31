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
      const water = new WaterTerrain();
      const rail = new RailTerrain();
      const waterOrPasture = new WaterOrPastureTerrain();
      const waterResult = isStrict(water);
      const railResult = isStrict(rail);
      const waterOrPastureResult = isStrict(waterOrPasture);
      expect(waterResult).toBe(true);
      expect(railResult).toBe(true);
      expect(waterOrPastureResult).toBe(true);
    });

    it('should return false for non-strict terrains', () => {
      const field = new FieldTerrain();
      const house = new HouseTerrain();
      const pasture = new PastureTerrain();
      const tree = new TreeTerrain();
      const fieldResult = isStrict(field);
      const houseResult = isStrict(house);
      const pastureResult = isStrict(pasture);
      const treeResult = isStrict(tree);
      expect(fieldResult).toBe(false);
      expect(houseResult).toBe(false);
      expect(pastureResult).toBe(false);
      expect(treeResult).toBe(false);
    });
  });

  describe('isPositionEmpty', () => {
    it('should return true if the coordinate has no tile', () => {
      const board = emptyBoard();
      const result = isPositionEmpty(board, origin);
      expect(result).toBe(true);
    });

    it('should return false if the coordinate has a tile', () => {
      const board = boardWithTile();
      const result = isPositionEmpty(board, origin);
      expect(result).toBe(false);
    });
  });

  describe('hasAdjacentTile', () => {
    it('should return false for an empty board', () => {
      const board = emptyBoard();
      const result = hasAdjacentTile(board, origin);
      expect(result).toBe(false);
    });

    it('should return true if there is an adjacent tile', () => {
      const board = boardWithTile();
      const neighborCoord = north(origin);
      const result = hasAdjacentTile(board, neighborCoord);
      expect(result).toBe(true);
    });

    it('should return false if tiles are far away', () => {
      const board = boardWithTile();
      const farCoord = north(north(origin));
      const result = hasAdjacentTile(board, farCoord);
      expect(result).toBe(false);
    });
  });

  describe('doStrictEdgesMatch', () => {
    it('should return true when a non-strict edge touches a non-strict edge', () => {
      const board = boardWithTile();
      const neighborCoord = north(origin);
      const testTile = new Tile({ south: new FieldTerrain() });
      const result = doStrictEdgesMatch(board, neighborCoord, testTile);
      expect(result).toBe(true);
    });

    it('should return false when a strict edge touches a mismatching non-strict edge', () => {
      const board = boardWithTile();
      const seCoord = southEast(origin);
      const testTile = new Tile({ northWest: new FieldTerrain() });
      const result = doStrictEdgesMatch(board, seCoord, testTile);
      expect(result).toBe(false);
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

      // Act
      const firstResult = doStrictEdgesMatch(board, seCoord, hybridTile);
      const secondResult = doStrictEdgesMatch(board, sCoord, hybridTile2);
      const thirdResult = doStrictEdgesMatch(board, nCoord, hybridTile3);

      // Assert
      expect(firstResult).toBe(true);
      expect(secondResult).toBe(true);
      expect(thirdResult).toBe(false);
    });
  });

  describe('isValidPlacement', () => {
    it('should return false if board is empty', () => {
      const board = emptyBoard();
      const result = isValidPlacement(board, origin, tile);
      expect(result).toBe(false);
    });

    it('should return true if adjacent tile exists and no strict mismatches', () => {
      const board = boardWithTile();
      const neighborCoord = north(origin);
      const validTile = new Tile({ south: new FieldTerrain() });
      const result = isValidPlacement(board, neighborCoord, validTile);
      expect(result).toBe(true);
    });

    it('should return false if spot is occupied', () => {
      const board = boardWithTile();
      const result = isValidPlacement(board, origin, tile);
      expect(result).toBe(false);
    });

    it('should return false if only far away tiles exist', () => {
      const board = boardWithTile();
      const farCoord = north(north(origin));
      const result = isValidPlacement(board, farCoord, tile);
      expect(result).toBe(false);
    });

    it('should return false if placing water next to non-water', () => {
      const board = boardWithTile();
      const seCoord = southEast(origin);
      const fieldTile = new Tile({ northWest: new FieldTerrain() });
      const result = isValidPlacement(board, seCoord, fieldTile);
      expect(result).toBe(false);
    });
  });
});
