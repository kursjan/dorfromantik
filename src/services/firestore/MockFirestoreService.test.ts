import { describe, it, expect, beforeEach } from 'vitest';

import { MockFirestoreService } from './MockFirestoreService';
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

describe('MockFirestoreService', () => {
  const mockFirestoreService = new MockFirestoreService();

  beforeEach(() => {
    mockFirestoreService._resetMockStore();
  });

  it('saves game state to mock store', async () => {
    const mockUserId = 'test-user';
    const mockGame = createTestGame();

    await mockFirestoreService.saveGameState(mockUserId, mockGame);

    const result = await mockFirestoreService.loadGameState(mockUserId, mockGame.id);
    expect(result).toBeInstanceOf(Game);
    expect(result?.id).toBe(mockGame.id);
  });

  it('loads game state from mock store', async () => {
    const mockUserId = 'test-user';
    const mockGame = createTestGame();

    await mockFirestoreService.saveGameState(mockUserId, mockGame);
    const result = await mockFirestoreService.loadGameState(mockUserId, mockGame.id);

    expect(result).toBeInstanceOf(Game);
    expect(result?.id).toBe(mockGame.id);
  });

  it('returns null when game does not exist', async () => {
    const mockUserId = 'test-user';
    const mockGameId = 'non-existent-game';

    const result = await mockFirestoreService.loadGameState(mockUserId, mockGameId);

    expect(result).toBeNull();
  });

  it('loads all games for a user', async () => {
    const mockUserId = 'test-user';
    const game1 = createTestGame('game-1');
    const game2 = createTestGame('game-2');

    await mockFirestoreService.saveGameState(mockUserId, game1);
    await mockFirestoreService.saveGameState(mockUserId, game2);

    const results = await mockFirestoreService.loadAllGames(mockUserId);

    expect(results).toHaveLength(2);
    expect(results[0]).toBeInstanceOf(Game);
    expect(results[1]).toBeInstanceOf(Game);
  });

  it('returns empty array when no games exist for user', async () => {
    const mockUserId = 'test-user';

    const results = await mockFirestoreService.loadAllGames(mockUserId);

    expect(results).toHaveLength(0);
  });

  it('resets mock store', async () => {
    const mockUserId = 'test-user';
    const mockGame = createTestGame();

    await mockFirestoreService.saveGameState(mockUserId, mockGame);
    mockFirestoreService._resetMockStore();

    const result = await mockFirestoreService.loadGameState(mockUserId, mockGame.id);
    expect(result).toBeNull();
  });

  it('handles multiple users independently', async () => {
    const user1 = 'user-1';
    const user2 = 'user-2';
    const game1 = createTestGame('user1-game');
    const game2 = createTestGame('user2-game');

    await mockFirestoreService.saveGameState(user1, game1);
    await mockFirestoreService.saveGameState(user2, game2);

    const user1Games = await mockFirestoreService.loadAllGames(user1);
    const user2Games = await mockFirestoreService.loadAllGames(user2);

    expect(user1Games).toHaveLength(1);
    expect(user2Games).toHaveLength(1);
    expect(user1Games[0].id).toBe(game1.id);
    expect(user2Games[0].id).toBe(game2.id);
  });
});