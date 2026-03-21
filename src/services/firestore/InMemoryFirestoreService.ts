// src/services/firestore/MockFirestoreService.ts
import { GameSerializer } from '../../models/GameSerializer';
import { Game } from '../../models/Game';
import { SAVED_GAME_VERSION, type SavedGameDoc } from './firestore-types';
import type { IFirestoreService } from './IFirestoreService';

// Mock in-memory store
let mockSavedGames: Map<string, Map<string, SavedGameDoc>> = new Map();
// Listeners map: userId -> Set of callbacks
const listeners: Map<string, Set<(games: Game[]) => void>> = new Map();

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
  async saveGameState(userId: string, game: Game): Promise<void> {
    if (!mockSavedGames.has(userId)) {
      mockSavedGames.set(userId, new Map());
    }
    mockSavedGames.get(userId)!.set(game.id, {
      version: SAVED_GAME_VERSION,
      gameId: game.id,
      userId,
      gameState: GameSerializer.serialize(game),
      savedAt: new Date().toISOString(),
    });

    this._notifyListeners(userId);
  }

  async loadGameState(userId: string, gameId: string): Promise<Game | null> {
    const saved = mockSavedGames.get(userId)?.get(gameId);
    return saved ? GameSerializer.deserialize(saved.gameState) : null;
  }

  async loadAllGames(userId: string): Promise<Game[]> {
    const userGames = mockSavedGames.get(userId);
    if (!userGames) return [];
    return Array.from(userGames.values()).map(d =>
      GameSerializer.deserialize(d.gameState)
    );
  }

  subscribeToGames(userId: string, callback: (games: Game[]) => void): () => void {
    if (!listeners.has(userId)) {
      listeners.set(userId, new Set());
    }
    listeners.get(userId)!.add(callback);

    // Initial call with current data
    this.loadAllGames(userId).then(callback);

    return () => {
      listeners.get(userId)?.delete(callback);
      if (listeners.get(userId)?.size === 0) {
        listeners.delete(userId);
      }
    };
  }

  private async _notifyListeners(userId: string): Promise<void> {
    const userListeners = listeners.get(userId);
    if (!userListeners) return;

    const games = await this.loadAllGames(userId);
    userListeners.forEach(callback => callback(games));
  }

  /**
   * Resets the mock store (for testing).
   */
  _resetMockStore(): void {
    mockSavedGames = new Map();
    listeners.clear();
  }
}
