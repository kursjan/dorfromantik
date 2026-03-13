import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.hoisted(() => {
  vi.stubEnv('VITE_USE_MOCK_AUTH', '');
});

import { FirebaseFirestoreService } from './FirebaseFirestoreService';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
} from 'firebase/firestore';
import { Game } from '../../models/Game';
import { Board } from '../../models/Board';
import { GameRules } from '../../models/GameRules';
import { GameSerializer } from '../../models/GameSerializer';

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
  doc: vi.fn(),
  setDoc: vi.fn(),
  getDoc: vi.fn(),
  collection: vi.fn(),
  getDocs: vi.fn(),
}));

// Mock our local firebase initialization
const mockDb = vi.hoisted(() => ({}));
vi.mock('../firebase', () => ({
  db: mockDb,
}));

describe('FirebaseFirestoreService', () => {
  const firestoreService = new FirebaseFirestoreService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('saves game state to Firestore', async () => {
    const mockUserId = 'test-user';
    const mockGame = createTestGame('test-game');

    (doc as any).mockReturnValue('mock-doc-ref');
    (setDoc as any).mockResolvedValue(undefined);

    await firestoreService.saveGameState(mockUserId, mockGame);

    expect(doc).toHaveBeenCalledWith(mockDb, 'users', mockUserId, 'savedGames', 'test-game');
    expect(setDoc).toHaveBeenCalledWith('mock-doc-ref', expect.any(Object));
  });

  it('loads game state from Firestore', async () => {
    const mockUserId = 'test-user';
    const mockGameId = 'test-game';
    const mockGameState = GameSerializer.serialize(createTestGame());

    (doc as any).mockReturnValue('mock-doc-ref');
    (getDoc as any).mockResolvedValue({
      exists: () => true,
      data: () => ({ gameState: mockGameState }),
    });

    const result = await firestoreService.loadGameState(mockUserId, mockGameId);

    expect(doc).toHaveBeenCalledWith(mockDb, 'users', mockUserId, 'savedGames', mockGameId);
    expect(getDoc).toHaveBeenCalledWith('mock-doc-ref');
    expect(result).toBeInstanceOf(Game);
  });

  it('returns null when game does not exist', async () => {
    const mockUserId = 'test-user';
    const mockGameId = 'non-existent-game';

    (doc as any).mockReturnValue('mock-doc-ref');
    (getDoc as any).mockResolvedValue({ exists: () => false });

    const result = await firestoreService.loadGameState(mockUserId, mockGameId);

    expect(result).toBeNull();
  });

  it('loads all games for a user', async () => {
    const mockUserId = 'test-user';
    const mockGameState = GameSerializer.serialize(createTestGame());

    (collection as any).mockReturnValue('mock-col-ref');
    (getDocs as any).mockResolvedValue({
      docs: [
        { data: () => ({ gameState: mockGameState }) },
        { data: () => ({ gameState: mockGameState }) },
      ],
    });

    const results = await firestoreService.loadAllGames(mockUserId);

    expect(collection).toHaveBeenCalledWith(mockDb, 'users', mockUserId, 'savedGames');
    expect(getDocs).toHaveBeenCalledWith('mock-col-ref');
    expect(results).toHaveLength(2);
    expect(results[0]).toBeInstanceOf(Game);
  });
});