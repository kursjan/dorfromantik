import { describe, it, expect, beforeEach } from 'vitest';
import { Board } from './Board';
import { Tile } from './Tile';
import { HexCoordinate } from './HexCoordinate';

describe('Board', () => {
  let board: Board;
  let testTile: Tile;
  let testCoord: HexCoordinate;

  beforeEach(() => {
    board = new Board();
    testTile = new Tile({
      id: 'tile-1',
      north: 'field',
      northEast: 'field',
      southEast: 'field',
      south: 'field',
      southWest: 'field',
      northWest: 'field',
    });
    testCoord = new HexCoordinate(0, 0, 0);
  });

  it('places a tile and retrieves it', () => {
    board.place(testTile, testCoord);
    const retrieved = board.get(testCoord);

    expect(retrieved).toBeDefined();
    expect(retrieved?.tile).toBe(testTile);
    expect(retrieved?.coordinate).toEqual(testCoord);
    expect(retrieved?.id).toBe('0,0,0');
  });

  it('returns undefined for missing tile', () => {
    const missing = board.get(new HexCoordinate(1, -1, 0));
    expect(missing).toBeUndefined();
  });

  it('checks if tile exists with has()', () => {
    expect(board.has(testCoord)).toBe(false);
    board.place(testTile, testCoord);
    expect(board.has(testCoord)).toBe(true);
  });

  it('gets all placed tiles', () => {
    board.place(testTile, testCoord);
    board.place(testTile, new HexCoordinate(1, -1, 0));

    const all = board.getAll();
    expect(all).toHaveLength(2);
  });

  it('clears the board', () => {
    board.place(testTile, testCoord);
    board.clear();
    expect(board.getAll()).toHaveLength(0);
    expect(board.has(testCoord)).toBe(false);
  });

  it('throws error when placing on occupied position', () => {
    board.place(testTile, testCoord);
    expect(() => {
      board.place(testTile, testCoord);
    }).toThrow('Position 0,0,0 is already occupied');
  });
});
