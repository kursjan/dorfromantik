import { describe, it, expect, beforeEach, vi } from 'vitest';

import { InMemoryFirestoreService } from './InMemoryFirestoreService';
import { Game } from '../../models/Game';
import { Board } from '../../models/Board';
import { GameRules } from '../../models/GameRules';

function createTestGame(id = 'test-game-1'): Game {
  return new Game({
    id,
    name: 'Test Game',
    board: new Board(),
    rules: GameRules.createStandard(),
    score: 100,
  });
}

describe('InMemoryFirestoreService (Fake Implementation)', () => {
  const inMemoryFirestoreService = new InMemoryFirestoreService();

  beforeEach(() => {
    inMemoryFirestoreService._resetMockStore();
  });

  it('persists saved games and exposes them via subscribeToGames', async () => {
    const mockUserId = 'test-user';
    const mockGame = createTestGame();
    const callback = vi.fn();

    await inMemoryFirestoreService.saveGameState(mockUserId, mockGame);
    inMemoryFirestoreService.subscribeToGames(mockUserId, callback);

    await vi.waitFor(() => {
      expect(callback).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ id: mockGame.id })])
      );
    });
  });

  it('returns empty list for user with no saves (via subscribe)', async () => {
    const mockUserId = 'test-user';
    const callback = vi.fn();

    inMemoryFirestoreService.subscribeToGames(mockUserId, callback);

    await vi.waitFor(() => {
      expect(callback).toHaveBeenCalledWith([]);
    });
  });

  it('resets mock store', async () => {
    const mockUserId = 'test-user';
    const mockGame = createTestGame();
    const callback = vi.fn();

    await inMemoryFirestoreService.saveGameState(mockUserId, mockGame);
    inMemoryFirestoreService._resetMockStore();
    inMemoryFirestoreService.subscribeToGames(mockUserId, callback);

    await vi.waitFor(() => {
      expect(callback).toHaveBeenCalledWith([]);
    });
  });

  it('handles multiple users independently', async () => {
    const user1 = 'user-1';
    const user2 = 'user-2';
    const game1 = createTestGame('user1-game');
    const game2 = createTestGame('user2-game');
    const cb1 = vi.fn();
    const cb2 = vi.fn();

    await inMemoryFirestoreService.saveGameState(user1, game1);
    await inMemoryFirestoreService.saveGameState(user2, game2);

    inMemoryFirestoreService.subscribeToGames(user1, cb1);
    inMemoryFirestoreService.subscribeToGames(user2, cb2);

    await vi.waitFor(() => {
      expect(cb1).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ id: game1.id })])
      );
      expect(cb2).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ id: game2.id })])
      );
    });
  });

  it('notifies listeners when game state changes', async () => {
    const mockUserId = 'test-user';
    const callback = vi.fn();

    const unsubscribe = inMemoryFirestoreService.subscribeToGames(mockUserId, callback);

    await vi.waitFor(() => {
      expect(callback).toHaveBeenCalledWith([]);
    });

    callback.mockClear();

    const game = createTestGame('real-time-game');
    await inMemoryFirestoreService.saveGameState(mockUserId, game);

    await vi.waitFor(() => {
      expect(callback).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ id: 'real-time-game' })])
      );
    });

    unsubscribe();
  });
});
