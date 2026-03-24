// src/services/firestore/InMemoryFirestoreService.ts
import { GameSerializer } from '../../models/GameSerializer';
import { Game } from '../../models/Game';
import { SAVED_GAME_VERSION, type SavedGameDoc } from './firestore-types';
import type { IFirestoreService } from './IFirestoreService';

/**
 * In-memory implementation of IFirestoreService for non-Firebase environments.
 * 
 * This FAKE implementation provides a lightweight alternative to Firebase Firestore
 * with real behavioral logic. It's used in production when VITE_USE_MOCK_AUTH=true.
 * 
 * This allows the app to run without Firebase dependencies in:
 * - CI/CD environments
 * - E2E tests
 * - Local development
 * - Testing scenarios
 */
export class InMemoryFirestoreService implements IFirestoreService {
  // Mock in-memory store
  private savedGames: Map<string, Map<string, SavedGameDoc>> = new Map();
  // Listeners map: userId -> Set of callbacks
  private listeners: Map<string, Set<(games: Game[]) => void>> = new Map();

  async saveGameState(userId: string, game: Game): Promise<void> {
    if (!this.savedGames.has(userId)) {
      this.savedGames.set(userId, new Map());
    }
    this.savedGames.get(userId)!.set(game.id, {
      version: SAVED_GAME_VERSION,
      gameId: game.id,
      userId,
      gameState: GameSerializer.serialize(game),
      savedAt: new Date().toISOString(),
    });

    this._notifyListeners(userId);
  }

  async loadGameState(userId: string, gameId: string): Promise<Game | null> {
    const saved = this.savedGames.get(userId)?.get(gameId);
    return saved ? GameSerializer.deserialize(saved.gameState) : null;
  }

  async loadAllGames(userId: string): Promise<Game[]> {
    const userGames = this.savedGames.get(userId);
    if (!userGames) return [];
    return Array.from(userGames.values()).map(d =>
      GameSerializer.deserialize(d.gameState)
    );
  }

  subscribeToGames(userId: string, callback: (games: Game[]) => void): () => void {
    if (!this.listeners.has(userId)) {
      this.listeners.set(userId, new Set());
    }
    this.listeners.get(userId)!.add(callback);

    // Initial call with current data
    this.loadAllGames(userId).then(callback);

    return () => {
      this.listeners.get(userId)?.delete(callback);
      if (this.listeners.get(userId)?.size === 0) {
        this.listeners.delete(userId);
      }
    };
  }

  private async _notifyListeners(userId: string): Promise<void> {
    const userListeners = this.listeners.get(userId);
    if (!userListeners) return;

    const games = await this.loadAllGames(userId);
    userListeners.forEach(callback => callback(games));
  }

  /**
   * Resets the mock store (for testing).
   */
  _resetMockStore(): void {
    this.savedGames = new Map();
    this.listeners.clear();
  }
}
