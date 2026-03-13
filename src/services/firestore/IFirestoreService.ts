import { Game } from '../../models/Game';

export interface IFirestoreService {
  saveGameState(userId: string, game: Game): Promise<void>;
  loadGameState(userId: string, gameId: string): Promise<Game | null>;
  loadAllGames(userId: string): Promise<Game[]>;
  _resetMockStore(): void;
}