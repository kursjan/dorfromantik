import { describe, it, expect, beforeEach } from 'vitest';

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

  it('saves game state to mock store', async () => {
    const mockUserId = 'test-user';
    const mockGame = createTestGame();

    await inMemoryFirestoreService.saveGameState(mockUserId, mockGame);

    const result = await inMemoryFirestoreService.loadGameState(mockUserId, mockGame.id);
    expect(result).toBeInstanceOf(Game);
    expect(result?.id).toBe(mockGame.id);
  });

  it('loads game state from mock store', async () => {
    const mockUserId = 'test-user';
    const mockGame = createTestGame();

    await inMemoryFirestoreService.saveGameState(mockUserId, mockGame);
    const result = await inMemoryFirestoreService.loadGameState(mockUserId, mockGame.id);

    expect(result).toBeInstanceOf(Game);
    expect(result?.id).toBe(mockGame.id);
  });

  it('returns null when game does not exist', async () => {
    const mockUserId = 'test-user';
    const mockGameId = 'non-existent-game';

    const result = await inMemoryFirestoreService.loadGameState(mockUserId, mockGameId);

    expect(result).toBeNull();
  });

  it('loads all games for a user', async () => {
    const mockUserId = 'test-user';
    const game1 = createTestGame('game-1');
    const game2 = createTestGame('game-2');

    await inMemoryFirestoreService.saveGameState(mockUserId, game1);
    await inMemoryFirestoreService.saveGameState(mockUserId, game2);

    const results = await inMemoryFirestoreService.loadAllGames(mockUserId);

    expect(results).toHaveLength(2);
    expect(results[0]).toBeInstanceOf(Game);
    expect(results[1]).toBeInstanceOf(Game);
  });

  it('returns empty array when no games exist for user', async () => {
    const mockUserId = 'test-user';

    const results = await inMemoryFirestoreService.loadAllGames(mockUserId);

    expect(results).toHaveLength(0);
  });

  it('resets mock store', async () => {
    const mockUserId = 'test-user';
    const mockGame = createTestGame();

    await inMemoryFirestoreService.saveGameState(mockUserId, mockGame);
    inMemoryFirestoreService._resetMockStore();

    const result = await inMemoryFirestoreService.loadGameState(mockUserId, mockGame.id);
    expect(result).toBeNull();
  });

  it('handles multiple users independently', async () => {
    const user1 = 'user-1';
    const user2 = 'user-2';
    const game1 = createTestGame('user1-game');
    const game2 = createTestGame('user2-game');

    await inMemoryFirestoreService.saveGameState(user1, game1);
    await inMemoryFirestoreService.saveGameState(user2, game2);

    const user1Games = await inMemoryFirestoreService.loadAllGames(user1);
    const user2Games = await inMemoryFirestoreService.loadAllGames(user2);

    expect(user1Games).toHaveLength(1);
    expect(user2Games).toHaveLength(1);
    expect(user1Games[0].id).toBe(game1.id);
    expect(user2Games[0].id).toBe(game2.id);
  });

  it('notifies listeners when game state changes', async () => {
    const mockUserId = 'test-user';
    const callback = vi.fn();
    
    const unsubscribe = inMemoryFirestoreService.subscribeToGames(mockUserId, callback);
    
    // Should be called initially with current data (empty)
    await vi.waitFor(() => {
      expect(callback).toHaveBeenCalledWith([]);
    });
    
    callback.mockClear();
    
    // Save a game
    const game = createTestGame('real-time-game');
    await inMemoryFirestoreService.saveGameState(mockUserId, game);
    
    // Should be called again with new data
    await vi.waitFor(() => {
      expect(callback).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({ id: 'real-time-game' })
      ]));
    });
    
    unsubscribe();
  });
});