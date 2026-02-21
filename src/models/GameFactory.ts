import { Board } from './Board';
import { Game } from './Game';
import { GameRules } from './GameRules';
import { HexCoordinate } from './HexCoordinate';

/**
 * Factory for creating and initializing Game instances.
 */
export class GameFactory {
  /**
   * Creates a new game with the board initialized with a starting tile.
   * @param rules - The rules to use for the game.
   * @returns A fully initialized Game instance.
   */
  static createGame(rules: GameRules): Game {
    const board = new Board();
    
    // 1. Create and place initial tile at origin (0, 0, 0)
    // This is a "setup" step, so it doesn't use a turn from the game loop's queue.
    const startTile = rules.createInitialTile('start-tile');
    board.place(startTile, new HexCoordinate(0, 0, 0));

    // 2. Create the game instance
    // The Game constructor handles generating the rest of the tile queue.
    return new Game({
      board,
      rules,
    });
  }

  /**
   * Shorthand for creating a game with standard rules.
   */
  static createStandardGame(): Game {
    return this.createGame(GameRules.createStandard());
  }
}
