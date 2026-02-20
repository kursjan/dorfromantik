import { describe, it, expect, beforeEach } from 'vitest';
import { Game } from './Game';
import { Board } from './Board';
import { GameRules } from './GameRules';
import { Tile } from './Tile';
import { HexCoordinate } from './HexCoordinate';

describe('Game Integration (placeTile & Scoring)', () => {
  let board: Board;
  let rules: GameRules;
  let tile1: Tile;
  let tile2: Tile;

  beforeEach(() => {
    board = new Board();
    rules = new GameRules({ initialTurns: 10, pointsPerMatch: 10 });
    
    // Tile 1: All tree
    tile1 = new Tile({
      id: 't1',
      north: 'tree', northEast: 'tree', southEast: 'tree',
      south: 'tree', southWest: 'tree', northWest: 'tree'
    });

    // Tile 2: Mixed (North is tree, others are field)
    tile2 = new Tile({
      id: 't2',
      north: 'tree', northEast: 'field', southEast: 'field',
      south: 'field', southWest: 'field', northWest: 'field'
    });
  });

  it('should place a tile, consume a turn, and remove it from the queue', () => {
    const game = new Game({ board, rules, tileQueue: [tile1] });
    const coord = new HexCoordinate(0, 0, 0);

    game.placeTile(coord);

    expect(board.has(coord)).toBe(true);
    expect(game.remainingTurns).toBe(9);
    expect(game.tileQueue.length).toBe(0);
    expect(game.score).toBe(0); // No neighbors yet
  });

  it('should score points when placing a matching tile next to another', () => {
    const game = new Game({ board, rules, tileQueue: [tile1, tile2] });
    
    // Place tile1 at (0,0,0)
    const coord1 = new HexCoordinate(0, 0, 0);
    game.placeTile(coord1);

    // Place tile2 at (1,0,-1) which is SOUTH of (0,0,0)
    // So tile2's NORTH should match tile1's SOUTH.
    // tile1.south is 'tree', tile2.north is 'tree' -> MATCH!
    const coord2 = new HexCoordinate(1, 0, -1);
    game.placeTile(coord2);

    expect(game.score).toBe(10);
    expect(game.remainingTurns).toBe(8);
  });

  it('should NOT score points if terrains do not match', () => {
    const mismatchTile = new Tile({
      id: 't3',
      north: 'water', northEast: 'water', southEast: 'water',
      south: 'water', southWest: 'water', northWest: 'water'
    });

    const game = new Game({ board, rules, tileQueue: [tile1, mismatchTile] });
    
    game.placeTile(new HexCoordinate(0, 0, 0));
    game.placeTile(new HexCoordinate(1, 0, -1));

    expect(game.score).toBe(0);
  });

  it('should throw error if queue is empty', () => {
    const game = new Game({ board, rules, tileQueue: [] });
    expect(() => game.placeTile(new HexCoordinate(0,0,0))).toThrow('No tiles remaining in the queue');
  });
});
