import { Game } from '../../models/Game';

/**
 * Interface for FirestoreService, defining core game state persistence operations.
 */
export interface IFirestoreService {
  saveGameState(userId: string, game: Game): Promise<void>;
  loadGameState(userId: string, gameId: string): Promise<Game | null>;
  loadAllGames(userId: string): Promise<Game[]>;
}