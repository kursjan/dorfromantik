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
    const { board: newBoard } = board.place(tile, coord);

    expect(newBoard.has(coord)).toBe(true);
    expect(newBoard.get(coord)?.tile).toBe(tile);
    // Ensure original board is not mutated
    expect(board.has(coord)).toBe(false);
  });

  it('should throw an error when placing a tile on an occupied spot', () => {
    const tile = new Tile({ id: 'test-tile' });
    const { board: newBoard } = board.place(tile, coord);

    expect(() => newBoard.place(tile, coord)).toThrowError(/occupied/);
  });

  it('should canPlace return true for empty spot', () => {
    expect(board.canPlace(coord)).toBe(true);
  });

  it('should canPlace return false for occupied spot', () => {
    const tile = new Tile({ id: 'test-tile' });
    const { board: newBoard } = board.place(tile, coord);

    expect(newBoard.canPlace(coord)).toBe(false);
  });

  it('should clear the board', () => {
    const tile = new Tile({ id: 'test-tile' });
    const { board: newBoard } = board.place(tile, coord);
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

    const { board: board1 } = board.place(tile1, coord);
    const { board: board2 } = board1.place(tile2, coord2);

    const all = Array.from(board2.getAll());
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

    const { board: b1 } = board.place(tile1, coord);
    const { board: b2 } = b1.place(tile2, neighborCoord);
    const { board: b3 } = b2.place(tile3, nonNeighborCoord);

    const placedTile = b3.get(coord)!;
    const neighbors = b3.getExistingNeighbors(placedTile);

    expect(Object.keys(neighbors).length).toBe(1);
    expect(neighbors.north?.coordinate).toEqual(neighborCoord);
  });

  it('should return valid placement coordinates filtered by strict matching', () => {
    const placedTile = new Tile({
      id: 'origin-tile',
      southEast: toTerrain('water'),
      southWest: toTerrain('rail'),
    });
    const { board: newBoard } = board.place(placedTile, coord);

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
    const { board: newBoard } = board.place(placedTile, coord);

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
    const { board: b1 } = board.place(placedTile1, coord);

    const coord2 = southWest(coord);
    const placedTile2 = new Tile({
      id: 'tile-2',
      southEast: toTerrain('water'),
      southWest: toTerrain('rail'),
    });
    const { board: b2 } = b1.place(placedTile2, coord2);

    const freeTile = new Tile({ id: 'free-tile' });
    const validCoords = b2.getValidPlacementCoordinates(freeTile);

    expect(validCoords.length).toBe(5);
  });
});
