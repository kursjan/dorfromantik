import { describe, it, expect, beforeEach } from 'vitest';
import { Session } from './Session';
import { User } from './User';
import { Game } from './Game';
import { Board } from './Board';
import { GameRules } from './GameRules';
import { Tile } from './Tile';
import { HexCoordinate } from './HexCoordinate';

describe('Full Game Session Integration', () => {
  let user: User;
  let rules: GameRules;
  let session: Session;

  beforeEach(() => {
    user = new User('player-1');
    rules = new GameRules({ initialTurns: 10, pointsPerMatch: 10 });
    session = new Session('session-1', user);
  });

  it('should play a mini-game session and track all state changes correctly', () => {
    // 1. Setup a predictable Tile Queue
    // We'll create tiles where we know the terrains to test matching
    const tile1 = new Tile({
      id: 'tile-1',
      north: 'forest',
      northEast: 'forest',
      southEast: 'forest', // Changed from grass to forest
      south: 'grass',
      southWest: 'grass',
      northWest: 'grass',
    });

    const tile2 = new Tile({
      id: 'tile-2',
      north: 'grass',
      northEast: 'grass',
      southEast: 'grass',
      south: 'forest', // This will face tile1's North if placed at (1, 0, -1)
      southWest: 'grass',
      northWest: 'grass',
    });

    const tile3 = new Tile({
      id: 'tile-3',
      north: 'grass',
      northEast: 'grass',
      southEast: 'grass',
      south: 'grass',
      southWest: 'grass', // Matches tile2.northEast (grass)
      northWest: 'forest', // Matches tile1.southEast (forest)
    });

    const board = new Board();
    const game = new Game({ 
      board, 
      rules, 
      tileQueue: [tile1, tile2, tile3] 
    });

    // 2. Start the game in the session
    session.startNewGame(game);
    expect(session.activeGame).toBe(game);
    expect(game.remainingTurns).toBe(3);
    expect(game.score).toBe(0);

    // 3. Place first tile at Origin (0,0,0)
    // No neighbors yet, so score should be 0
    const origin = new HexCoordinate(0, 0, 0);
    game.placeTile(origin);
    
    expect(game.score).toBe(0);
    expect(game.remainingTurns).toBe(2);
    expect(board.get(origin)?.tile).toBe(tile1);

    // 4. Place second tile at South of Origin (1, 0, -1)
    // tile2.south (forest) faces tile1.north (forest) -> Match! (+10 points)
    const southCoord = new HexCoordinate(1, 0, -1);
    const result2 = game.placeTile(southCoord);
    
    expect(result2.scoreAdded).toBe(10);
    expect(game.score).toBe(10);
    expect(game.remainingTurns).toBe(1);
    expect(board.get(southCoord)?.tile).toBe(tile2);

    // 5. Place third tile at South-East of Origin (0, 1, -1)
    // Neighbors of (0, 1, -1):
    // - NorthWest (0, 1-1, -1+1) = (0, 0, 0) [tile1]
    // - South (0+1, 1, -1-1) = (1, 1, -2) [empty]
    // - SouthWest (0+1, 1-1, -1) = (1, 0, -1) [tile2]
    //
    // Matches with tile1 (0, 0, 0) at NorthWest of tile3:
    // tile3.northWest (forest) vs tile1.southEast (grass) -> No match.
    // Let's fix tile1.southEast to be 'forest' to match!
    
    // Matches with tile2 (1, 0, -1) at SouthWest of tile3:
    // tile3.southWest (grass) vs tile2.northEast (grass) -> Match! (+10)
    
    const southEastCoord = new HexCoordinate(0, 1, -1);
    const result3 = game.placeTile(southEastCoord);
    
    expect(result3.scoreAdded).toBe(20); // Two matches: tile1 and tile2!
    expect(game.score).toBe(30);
    expect(game.remainingTurns).toBe(0);
    expect(board.get(southEastCoord)?.tile).toBe(tile3);

    // 6. Verify Session State
    expect(session.activeGame).toBe(game);
    expect(session.games.length).toBe(0); // Not ended yet

    // 7. End Game
    session.endActiveGame();
    expect(session.activeGame).toBeUndefined();
    expect(session.games.length).toBe(1);
    expect(session.games[0].score).toBe(30);
  });
});
