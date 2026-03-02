import { beforeEach, describe, expect, it } from 'vitest';
import { Game } from './Game';
import { GameRules, SequenceTileGenerator } from './GameRules';
import { HexCoordinate } from './HexCoordinate';
import { south, southEast } from './Navigation';
import { Session } from './Session';
import { Tile } from './Tile';
import { User } from './User';

describe('Full Game Session Integration', () => {
  let user: User;
  let session: Session;

  beforeEach(() => {
    user = new User('player-1');
    session = new Session('session-1', user);
  });

  it('should play a mini-game session and track all state changes correctly', () => {
    /*
       FINAL BOARD STATE:
       (0,0,0) [tile-1]
          _ _          
        /  T  \        
       /P     T\ _ _ (0,1,-1) [tile-3]
       \P     T/  P  \ 
        \ _P_ /T     P\
        /  P  \P     P/
       /P     P\ _P_ / 
       \P     P/ 
        \ _T_ / 
       (1,0,-1) [tile-2]
    */

    // 1. Setup a predictable Tile Queue
    const tile1 = new Tile({
      id: 'tile-1',
      north: 'tree',
      northEast: 'tree',
      southEast: 'tree', 
      south: 'pasture',
      southWest: 'pasture',
      northWest: 'pasture',
    });

    const tile2 = new Tile({
      id: 'tile-2',
      north: 'pasture',
      northEast: 'pasture',
      southEast: 'pasture',
      south: 'tree',
      southWest: 'pasture',
      northWest: 'pasture',
    });

    const tile3 = new Tile({
      id: 'tile-3',
      north: 'pasture',
      northEast: 'pasture',
      southEast: 'pasture',
      south: 'pasture',
      southWest: 'pasture',
      northWest: 'tree',
    });

    const rules = new GameRules({
      initialTurns: 2,
      pointsPerMatch: 10,
      initialTileGenerator: new SequenceTileGenerator([tile1]),
      tileGenerator: new SequenceTileGenerator([tile2, tile3])
    });

    const game = Game.create(rules);
    const origin = new HexCoordinate(0, 0, 0);

    // 2. Start the game in the session
    session.startNewGame(game);
    expect(session.activeGame).toBe(game);

    // TODO: Assert size of tiles on board. 
    // expect(game.board.getAll()).toBe(1)
    expect(game.board.get(origin)?.tile).toBe(tile1);
    expect(game.remainingTurns).toBe(2);
    expect(game.score).toBe(0);


    // 4. Place second tile at South of Origin
    const southCoord = south(origin);
    const result2 = game.placeTile(southCoord);
    
    expect(result2.scoreAdded).toBe(10);
    expect(game.score).toBe(10);
    expect(game.remainingTurns).toBe(1);
    expect(game.board.get(southCoord)?.tile).toBe(tile2);

    // 5. Place third tile at South-East of Origin
    const southEastCoord = southEast(origin);
    const result3 = game.placeTile(southEastCoord);
    
    expect(result3.scoreAdded).toBe(20); // Two matches: tile1 and tile2!
    expect(game.score).toBe(30);
    expect(game.remainingTurns).toBe(0);
    expect(game.board.get(southEastCoord)?.tile).toBe(tile3);

    // 6. Verify Session State
    expect(session.activeGame).toBe(game);
    expect(session.games.length).toBe(0);

    // 7. End Game
    // TODO: this end game is weird, it should end once turns run out
    session.endActiveGame();
    expect(session.activeGame).toBeUndefined();
    expect(session.games.length).toBe(1);
    expect(session.games[0].score).toBe(30);
  });
});
