import { describe, it, expect, beforeEach } from 'vitest';
import { Board } from './Board';
import { Tile } from './Tile';
import { HexCoordinate } from './HexCoordinate';
import { isValidPlacement } from './PlacementValidator';
import {
  FieldTerrain,
  HouseTerrain,
  PastureTerrain,
  RailTerrain,
  TreeTerrain,
  WaterTerrain,
} from './Terrain';

describe('PlacementValidator', () => {
  let board: Board;
  const tile = new Tile({
    id: 'test-tile',
    north: new TreeTerrain(),
    northEast: new HouseTerrain(),
    southEast: new WaterTerrain(),
    south: new PastureTerrain(),
    southWest: new RailTerrain(),
    northWest: new FieldTerrain(),
  });
  const origin = new HexCoordinate(0, 0, 0);

  beforeEach(() => {
    board = new Board();
  });

  it('should return false if board is empty', () => {
    expect(isValidPlacement(board, origin)).toBe(false);
  });

  it('should return true if adjacent tile exists', () => {
    board.place(tile, origin);

    const neighborCoord = new HexCoordinate(-1, 0, 1); // North
    expect(isValidPlacement(board, neighborCoord)).toBe(true);
  });

  it('should return false if spot is occupied', () => {
    board.place(tile, origin);
    expect(isValidPlacement(board, origin)).toBe(false);
  });

  it('should return false if only far away tiles exist', () => {
    board.place(tile, origin);

    const farCoord = new HexCoordinate(2, 0, -2); // Far away
    expect(isValidPlacement(board, farCoord)).toBe(false);
  });
});
