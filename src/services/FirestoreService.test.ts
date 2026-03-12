import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.hoisted(() => {
  vi.stubEnv('VITE_USE_MOCK_AUTH', '');
});

import { SAVED_GAME_VERSION, type SavedGameDoc } from './firestore-types';
import { Game } from '../models/Game';
import { Board } from '../models/Board';
import { GameRules } from '../models/GameRules';
import { GameSerializer } from '../models/GameSerializer';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
} from 'firebase/firestore';
import { FirestoreService } from './FirestoreService';

function createTestGame(id = 'test-game-1'): Game {
  return new Game({
    id,
    name: 'Test Game',
    board: new Board(),
    rules: GameRules.createStandard(),
    score: 100,
  });
}

// Mock Firebase Firestore
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  doc: vi.fn(),
  setDoc: vi.fn(),
  getDoc: vi.fn(),
  collection: vi.fn(),
  getDocs: vi.fn(),
}));

vi.mock('./firebase', () => ({
  db: {},
}));

describe('FirestoreService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('saveGameState', () => {
    it('should write a SavedGameDoc to the correct Firestore path', async () => {
      const mockRef = { id: 'ref' };
      doc.mockReturnValue(mockRef);
      setDoc.mockResolvedValue(undefined);

      const game = createTestGame();
      await FirestoreService.saveGameState('user-1', game);

      expect(doc).toHaveBeenCalledWith(expect.anything(), 'users', 'user-1', 'savedGames', 'test-game-1');
      expect(setDoc).toHaveBeenCalledWith(mockRef, expect.objectContaining({
        gameId: 'test-game-1',
        userId: 'user-1',
        gameState: GameSerializer.serialize(game),
      }));
    });

    it('should include savedAt timestamp and version', async () => {
      doc.mockReturnValue({});
      setDoc.mockResolvedValue(undefined);

      const game = createTestGame();
      await FirestoreService.saveGameState('user-1', game);

      const savedDoc = setDoc.mock.calls[0][1] as SavedGameDoc;
      expect(savedDoc.savedAt).toBeDefined();
      expect(new Date(savedDoc.savedAt).getTime()).not.toBeNaN();
      expect(savedDoc.version).toBe(SAVED_GAME_VERSION);
    });
  });

  describe('loadGameState', () => {
    it('should return a Game when document exists', async () => {
      const game = createTestGame();
      const serialized = GameSerializer.serialize(game);
      doc.mockReturnValue({});
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ gameState: serialized }),
      });

      const result = await FirestoreService.loadGameState('user-1', 'test-game-1');

      expect(result).not.toBeNull();
      expect(result!.id).toBe('test-game-1');
      expect(result!.score).toBe(100);
    });

    it('should return null when document does not exist', async () => {
      doc.mockReturnValue({});
      getDoc.mockResolvedValue({
        exists: () => false,
      });

      const result = await FirestoreService.loadGameState('user-1', 'no-such-game');
      expect(result).toBeNull();
    });
  });

  describe('loadAllGames', () => {
    it('should return all games for a user', async () => {
      const game1 = createTestGame('game-1');
      const game2 = createTestGame('game-2');
      collection.mockReturnValue({});
      getDocs.mockResolvedValue({
        docs: [
          { data: () => ({ gameState: GameSerializer.serialize(game1) }) },
          { data: () => ({ gameState: GameSerializer.serialize(game2) }) },
        ],
      });

      const result = await FirestoreService.loadAllGames('user-1');

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('game-1');
      expect(result[1].id).toBe('game-2');
    });

    it('should return empty array when user has no games', async () => {
      collection.mockReturnValue({});
      getDocs.mockResolvedValue({ docs: [] });

      const result = await FirestoreService.loadAllGames('user-1');
      expect(result).toEqual([]);
    });
  });
});

// Mock mode is still covered indirectly via FirestoreService's internal mock store.
