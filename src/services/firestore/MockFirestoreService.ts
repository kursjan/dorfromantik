// src/services/firestore/MockFirestoreService.ts
import { GameSerializer } from '../../models/GameSerializer';
import { Game } from '../../models/Game';
import { SAVED_GAME_VERSION, type SavedGameDoc } from './firestore-types';
import type { IFirestoreService } from './IFirestoreService';

// Mock in-memory store
let mockSavedGames: Map<string, Map<string, SavedGameDoc>> = new Map();

/**
 * Mock implementation of IFirestoreService for testing.
 */
export class MockFirestoreService implements IFirestoreService {
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

  /**
   * Resets the mock store (for testing).
   */
  _resetMockStore(): void {
    mockSavedGames = new Map();
  }
}