import { User } from './User';
import { Game } from './Game';

/**
 * Represents a session for a user, containing their game history and an active game.
 */
export class Session {
  readonly sessionId: string;
  readonly user: User;
  readonly games: Game[];
  activeGame?: Game;

  /**
   * Creates a new Session.
   * @param sessionId - Unique identifier for the session.
   * @param user - The user associated with the session.
   * @param activeGame - (Optional) Current active game.
   * @param games - (Optional) History of games.
   */
  constructor(sessionId: string, user: User, activeGame?: Game, games: Game[] = []) {
    this.sessionId = sessionId;
    this.user = user;
    this.activeGame = activeGame;
    this.games = games;
  }

  /**
   * Starts a new game. If there's already an active game, it will be moved to the history.
   * @param game - The new game to start.
   */
  startNewGame(game: Game): void {
    if (this.activeGame) {
      this.endActiveGame();
    }
    this.activeGame = game;
  }

  /**
   * Ends the current active game and adds it to the session's history.
   * @throws Error if there is no active game.
   */
  endActiveGame(): void {
    if (!this.activeGame) {
      throw new Error('No active game to end');
    }
    this.games.push(this.activeGame);
    this.activeGame = undefined;
  }
}
