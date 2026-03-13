import { Game } from '../models/Game';

/**
 * Interface for FirestoreService, defining core game state persistence operations.
 */
export interface IFirestoreService {
  /**
   * Saves the current game state for a user.
   * @param userId - The user's unique identifier.
   * @param game - The game to save.
   * @returns Promise resolving when the save is complete.
   */
  saveGameState(userId: string, game: Game): Promise<void>;

  /**
   * Loads a specific game state for a user.
   * @param userId - The user's unique identifier.
   * @param gameId - The game's unique identifier.
   * @returns Promise resolving to the loaded Game, or null if not found.
   */
  loadGameState(userId: string, gameId: string): Promise<Game | null>;

  /**
   * Loads all game states for a user.
   * @param userId - The user's unique identifier.
   * @returns Promise resolving to an array of the user's games.
   */
  loadAllGames(userId: string): Promise<Game[]>;

  /**
   * Reset in-memory mock store. Test-only method.
   */
  _resetMockStore(): void;
}