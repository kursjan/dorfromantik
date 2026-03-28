import { describe, it, expect, beforeEach } from 'vitest';
import { Board } from './Board';
import { Tile } from './Tile';
import { toTerrain } from './Terrain';
import { HexCoordinate } from './HexCoordinate';

describe('Board', () => {
  let board: Board;
  const tile = new Tile({
    id: 'test-tile',
    north: toTerrain('tree'),
    northEast: toTerrain('house'),
    southEast: toTerrain('water'),
    south: toTerrain('pasture'),
    southWest: toTerrain('rail'),
    northWest: toTerrain('field'),
  });
  const coord = new HexCoordinate(0, 0, 0);

  beforeEach(() => {
    board = new Board();
  });

  it('should place a tile correctly', () => {
    board.place(tile, coord);
    expect(board.has(coord)).toBe(true);
    expect(board.get(coord)?.tile).toBe(tile);
  });

  it('should throw an error when placing a tile on an occupied spot', () => {
    board.place(tile, coord);
    expect(() => board.place(tile, coord)).toThrowError(/occupied/);
  });

  it('should canPlace return true for empty spot', () => {
    expect(board.canPlace(coord)).toBe(true);
  });

  it('should canPlace return false for occupied spot', () => {
    board.place(tile, coord);
    expect(board.canPlace(coord)).toBe(false);
  });

  it('should clear the board', () => {
    board.place(tile, coord);
    board.clear();
    expect(board.has(coord)).toBe(false);
    expect(Array.from(board.getAll()).length).toBe(0);
  });

  it('should return all tiles', () => {
    const tile2 = new Tile({ ...tile, id: 'test-tile-2' });
    const coord2 = new HexCoordinate(1, -1, 0);

    board.place(tile, coord);
    board.place(tile2, coord2);

    const all = Array.from(board.getAll());
    expect(all.length).toBe(2);
    expect(all.some((t) => t.tile === tile)).toBe(true);
    expect(all.some((t) => t.tile === tile2)).toBe(true);
  });

  it('should return existing neighbors correctly', () => {
    const neighborCoord = new HexCoordinate(-1, 0, 1);
    const nonNeighborCoord = new HexCoordinate(2, 0, -2);

    board.place(tile, coord); // Origin
    board.place(tile, neighborCoord); // North of origin
    board.place(tile, nonNeighborCoord); // Far away

    const placedTile = board.get(coord)!;
    const neighbors = board.getExistingNeighbors(placedTile);

    expect(Object.keys(neighbors).length).toBe(1);
    expect(neighbors.north?.coordinate.getKey()).toBe(neighborCoord.getKey());
  });

  it('should return all valid placement coordinates around placed tiles', () => {
    board.place(tile, coord); // (0,0,0)
    const validCoords = board.getValidPlacementCoordinates();

    // 6 neighbors of (0,0,0) should be valid
    expect(validCoords.length).toBe(6);

    const neighborKeys = new Set(validCoords.map((c) => c.getKey()));
    expect(neighborKeys.has('0,1,-1')).toBe(true); // North (Actually North in this system is (-1, 0, 1)? Let's check Navigation)
  });

  it('should return unique placement coordinates when multiple tiles are placed', () => {
    const coord2 = new HexCoordinate(1, -1, 0); // One neighbor of origin
    board.place(tile, coord);
    board.place(tile, coord2);

    const validCoords = board.getValidPlacementCoordinates();

    // Origin has 6 neighbors. Neighbor (1,-1,0) is occupied.
    // So 5 neighbors from origin + neighbors of (1,-1,0) that are not origin or occupied.
    // Neighbors of (0,0,0): (0,1,-1), (1,0,-1), (1,-1,0) [OCCUPIED], (0,-1,1), (-1,0,1), (-1,1,0)
    // Neighbors of (1,-1,0): (1,0,-1), (2,-1,-1), (2,-2,0), (1,-2,1), (0,-1,1), (0,0,0) [OCCUPIED]
    // Unique valid: (0,1,-1), (1,0,-1), (0,-1,1), (-1,0,1), (-1,1,0), (2,-1,-1), (2,-2,0), (1,-2,1)
    // Total 8
    expect(validCoords.length).toBe(8);
  });
});
