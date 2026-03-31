import { describe, it, expect, beforeEach } from 'vitest';
import { Board } from './Board';
import { Tile } from './Tile';
import { toTerrain } from './Terrain';
import { HexCoordinate } from './HexCoordinate';
import { north, northEast, southEast, south, southWest, northWest } from './Navigation';

describe('Board', () => {
  let board: Board;
  const coord = new HexCoordinate(0, 0, 0);

  beforeEach(() => {
    board = new Board();
  });

  it('should place a tile correctly', () => {
    const tile = new Tile({ id: 'test-tile' });
    const newBoard = board.withTile(tile, coord);

    expect(newBoard.has(coord)).toBe(true);
    expect(newBoard.get(coord)?.tile).toBe(tile);
    // Ensure original board is not mutated
    expect(board.has(coord)).toBe(false);
  });

  it('should throw an error when placing a tile on an occupied spot', () => {
    const tile = new Tile({ id: 'test-tile' });
    const newBoard = board.withTile(tile, coord);

    expect(() => newBoard.place(tile, coord)).toThrowError(/occupied/);
  });

  it('should canPlace return true for empty spot', () => {
    expect(board.canPlace(coord)).toBe(true);
  });

  it('should canPlace return false for occupied spot', () => {
    const tile = new Tile({ id: 'test-tile' });
    const newBoard = board.withTile(tile, coord);

    expect(newBoard.canPlace(coord)).toBe(false);
  });

  it('should clear the board', () => {
    const tile = new Tile({ id: 'test-tile' });
    const newBoard = board.withTile(tile, coord);
    const emptyBoard = newBoard.clear();

    expect(emptyBoard.has(coord)).toBe(false);
    expect(Array.from(emptyBoard.getAll()).length).toBe(0);
    // Original still has it
    expect(newBoard.has(coord)).toBe(true);
  });

  it('should return all tiles', () => {
    const tile1 = new Tile({ id: 'test-tile-1' });
    const tile2 = new Tile({ id: 'test-tile-2' });
    const coord2 = southWest(coord);

    board = board.withTile(tile1, coord).withTile(tile2, coord2);

    const all = Array.from(board.getAll());
    expect(all.length).toBe(2);
    expect(all.some((t) => t.tile === tile1)).toBe(true);
    expect(all.some((t) => t.tile === tile2)).toBe(true);
  });

  it('should return existing neighbors correctly', () => {
    const tile1 = new Tile({ id: 'origin-tile' });
    const tile2 = new Tile({ id: 'neighbor-tile' });
    const tile3 = new Tile({ id: 'far-tile' });

    const neighborCoord = north(coord);
    const nonNeighborCoord = north(north(coord));

    board = board
      .withTile(tile1, coord)
      .withTile(tile2, neighborCoord)
      .withTile(tile3, nonNeighborCoord);

    const placedTile = board.get(coord)!;
    const neighbors = board.getExistingNeighbors(placedTile);

    expect(Object.keys(neighbors).length).toBe(1);
    expect(neighbors.north?.coordinate).toEqual(neighborCoord);
  });

  it('should return valid placement coordinates filtered by strict matching', () => {
    const placedTile = new Tile({
      id: 'origin-tile',
      southEast: toTerrain('water'),
      southWest: toTerrain('rail'),
    });
    const newBoard = board.withTile(placedTile, coord);

    const freeTile = new Tile({ id: 'free-tile' });
    const validCoords = newBoard.getValidPlacementCoordinates(freeTile);

    expect(validCoords.length).toBe(4);

    expect(validCoords).toContainEqual(north(coord));
    expect(validCoords).toContainEqual(northEast(coord));
    expect(validCoords).toContainEqual(south(coord));
    expect(validCoords).toContainEqual(northWest(coord));

    expect(validCoords).not.toContainEqual(southEast(coord));
    expect(validCoords).not.toContainEqual(southWest(coord));
  });

  it('should include strict coordinates if the tile matches them', () => {
    const placedTile = new Tile({
      id: 'origin-tile',
      southEast: toTerrain('water'),
      southWest: toTerrain('rail'),
    });
    const newBoard = board.withTile(placedTile, coord);

    const matchingTile = new Tile({
      id: 'matching-tile',
      northWest: toTerrain('water'),
      northEast: toTerrain('rail'),
    });

    const validCoords = newBoard.getValidPlacementCoordinates(matchingTile);

    expect(validCoords.length).toBe(6);
  });

  it('should return unique placement coordinates when multiple tiles are placed', () => {
    const placedTile1 = new Tile({
      id: 'tile-1',
      southEast: toTerrain('water'),
      southWest: toTerrain('rail'),
    });

    const coord2 = southWest(coord);
    const placedTile2 = new Tile({
      id: 'tile-2',
      southEast: toTerrain('water'),
      southWest: toTerrain('rail'),
    });
    board = board.withTile(placedTile1, coord).withTile(placedTile2, coord2);

    const freeTile = new Tile({ id: 'free-tile' });
    const validCoords = board.getValidPlacementCoordinates(freeTile);

    expect(validCoords.length).toBe(5);
  });
});
