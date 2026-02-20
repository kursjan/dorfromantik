import { describe, it, expect, beforeEach } from 'vitest';
import { Game } from './Game';
import { Board } from './Board';
import { GameRules } from './GameRules';
import { Tile } from './Tile';

describe('Game', () => {
  let board: Board;
  let rules: GameRules;

  beforeEach(() => {
    board = new Board();
    rules = new GameRules({ initialTurns: 30 });
  });

  it('should initialize with correct default values', () => {
    const game = new Game({ board, rules });
    expect(game.board).toBe(board);
    expect(game.rules).toBe(rules);
    expect(game.score).toBe(0);
    expect(game.remainingTurns).toBe(30);
    expect(game.tileQueue).toEqual([]);
  });

  it('should allow setting an initial tile queue', () => {
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
  });

  it('should throw error if score is negative', () => {
    expect(() => new Game({ board, rules, score: -10 })).toThrow('score must be non-negative');
  });

  it('should throw error if remainingTurns is negative', () => {
    expect(() => new Game({ board, rules, remainingTurns: -5 })).toThrow('remainingTurns must be non-negative');
  });
});
