import { describe, it, expect, beforeEach } from 'vitest';
import { Board } from './Board';
import { Tile } from './Tile';
import { HexCoordinate } from './HexCoordinate';

describe('Board', () => {
  let board: Board;
  const tile = new Tile({
    id: 'test-tile',
    north: 'tree',
    northEast: 'house',
    southEast: 'water',
    south: 'pasture',
    southWest: 'rail',
    northWest: 'field',
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
    expect(all.some(t => t.tile === tile)).toBe(true);
    expect(all.some(t => t.tile === tile2)).toBe(true);
  });
});
