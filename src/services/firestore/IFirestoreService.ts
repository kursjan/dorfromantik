import { Game } from '../../models/Game';

/**
 * Interface for FirestoreService, defining core game state persistence operations.
 */
export interface IFirestoreService {
  saveGameState(userId: string, game: Game): Promise<void>;
  loadGameState(userId: string, gameId: string): Promise<Game | null>;
  loadAllGames(userId: string): Promise<Game[]>;
  /**
   * Subscribes to changes in the user's games collection.
   * @param userId - The ID of the user whose games to subscribe to.
   * @param callback - Function called with the updated list of games whenever a change occurs.
   * @returns Unsubscribe function to stop listening.
   */
  subscribeToGames(userId: string, callback: (games: Game[]) => void): () => void;
}