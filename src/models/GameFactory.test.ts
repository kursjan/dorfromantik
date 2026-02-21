import { describe, it, expect } from 'vitest';
import { GameFactory } from './GameFactory';
import { GameRules } from './GameRules';
import { HexCoordinate } from './HexCoordinate';

describe('GameFactory', () => {
  it('should create a game with an initial tile placed at origin', () => {
    const rules = new GameRules({
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

    const game = GameFactory.createGame(rules);

    expect(game.rules).toBe(rules);
    expect(game.remainingTurns).toBe(10);
    
    // Verify initial tile is placed at origin
    const origin = new HexCoordinate(0, 0, 0);
    const placedTile = game.board.get(origin);
    expect(placedTile).toBeDefined();
    expect(placedTile?.tile.north).toBe('pasture');
  });

  it('should create a standard game with a pasture starter tile', () => {
    const game = GameFactory.createStandardGame();
    
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
