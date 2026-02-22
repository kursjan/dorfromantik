import { describe, it, expect, beforeEach } from 'vitest';
import { Game } from './Game';
import { Board } from './Board';
import { GameRules } from './GameRules';
import { Tile } from './Tile';
import { HexCoordinate } from './HexCoordinate';

describe('Game', () => {
  let board: Board;
  let rules: GameRules;

  beforeEach(() => {
    board = new Board();
    rules = new GameRules({ initialTurns: 30 });
  });

  describe('Factory Methods', () => {
    it('should create a game with an initial tile placed at origin', () => {
      const customRules = new GameRules({
        initialTurns: 10,
        initialTile: {
          north: 'pasture',
          northEast: 'pasture',
          southEast: 'pasture',
          south: 'pasture',
          southWest: 'pasture',
          northWest: 'pasture'
        }
      });

      const game = Game.create(customRules);

      expect(game.rules).toBe(customRules);
      expect(game.remainingTurns).toBe(10);
      
      // Verify initial tile is placed at origin
      const origin = new HexCoordinate(0, 0, 0);
      const placedTile = game.board.get(origin);
      expect(placedTile).toBeDefined();
      expect(placedTile?.tile.north).toBe('pasture');
    });

    it('should create a standard game with a pasture starter tile', () => {
      const game = Game.createStandard();
      
      expect(game.remainingTurns).toBe(30);
      
      const origin = new HexCoordinate(0, 0, 0);
      const placedTile = game.board.get(origin);
      
      expect(placedTile).toBeDefined();
      const tile = placedTile!.tile;
      expect(tile.north).toBe('pasture');
      expect(tile.northEast).toBe('pasture');
      expect(tile.southEast).toBe('pasture');
      expect(tile.south).toBe('pasture');
      expect(tile.southWest).toBe('pasture');
      expect(tile.northWest).toBe('pasture');
    });
  });

  it('should initialize with correct default values and random tiles', () => {
    const game = new Game({ board, rules });
    expect(game.board).toBe(board);
    expect(game.rules).toBe(rules);
    expect(game.score).toBe(0);
    expect(game.remainingTurns).toBe(30);
    expect(game.tileQueue.length).toBe(30);
  });

  it('should allow setting a custom initial tile queue', () => {
    const tile = new Tile({
      id: 't1',
      north: 'tree',
      northEast: 'tree',
      southEast: 'tree',
      south: 'tree',
      southWest: 'tree',
      northWest: 'tree',
    });
    const game = new Game({ board, rules, tileQueue: [tile] });
    expect(game.tileQueue).toEqual([tile]);
    expect(game.remainingTurns).toBe(1);
  });

  it('should peek the top of the queue without removing it', () => {
    const tile = new Tile({
      id: 't1',
      north: 'tree', northEast: 'tree', southEast: 'tree',
      south: 'tree', southWest: 'tree', northWest: 'tree'
    });
    const game = new Game({ board, rules, tileQueue: [tile] });
    
    expect(game.peek()).toBe(tile);
    expect(game.remainingTurns).toBe(1);
  });

  describe('isValidPlacement', () => {
    it('should return false if the position is already occupied', () => {
      const coord = new HexCoordinate(0, 0, 0);
      board.place(Tile.createRandom('t1'), coord);
      const game = new Game({ board, rules });

      expect(game.isValidPlacement(coord)).toBe(false);
    });

    it('should return false if the position is not adjacent to any existing tile', () => {
      const origin = new HexCoordinate(0, 0, 0);
      board.place(Tile.createRandom('t1'), origin);
      const game = new Game({ board, rules });

      // (2, 0, -2) is not adjacent to (0, 0, 0)
      const farCoord = new HexCoordinate(2, 0, -2);
      expect(game.isValidPlacement(farCoord)).toBe(false);
    });

    it('should return true if the position is empty and adjacent to an existing tile', () => {
      const origin = new HexCoordinate(0, 0, 0);
      board.place(Tile.createRandom('t1'), origin);
      const game = new Game({ board, rules });

      // (1, 0, -1) is adjacent to (0, 0, 0)
      const adjCoord = new HexCoordinate(1, 0, -1);
      expect(game.isValidPlacement(adjCoord)).toBe(true);
    });
  });

  it('should throw error if score is negative', () => {
    expect(() => new Game({ board, rules, score: -10 })).toThrow('score must be non-negative');
  });
});
