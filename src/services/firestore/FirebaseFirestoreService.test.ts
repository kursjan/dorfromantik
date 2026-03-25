import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.hoisted(() => {
  vi.stubEnv('VITE_USE_MOCK_AUTH', '');
});

import { FirebaseFirestoreService } from './FirebaseFirestoreService';
import {
  doc,
  setDoc,
  collection,
  onSnapshot,
  query,
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
  collection: vi.fn(),
  onSnapshot: vi.fn(),
  query: vi.fn(),
}));

// Mock our local firebase initialization
const mockDb = vi.hoisted(() => ({}));
vi.mock('../firebase', () => ({
  db: mockDb,
}));

describe('FirebaseFirestoreService (Real Implementation)', () => {
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

  it('subscribes to games in Firestore', () => {
    const mockUserId = 'test-user';
    const callback = vi.fn();
    const mockUnsubscribe = vi.fn();

    (collection as any).mockReturnValue('mock-col-ref');
    (query as any).mockReturnValue('mock-query');
    (onSnapshot as any).mockImplementation((_q: any, onSuccess: any) => {
      onSuccess({
        docs: [
          { data: () => ({ gameState: GameSerializer.serialize(createTestGame('g1')) }) }
        ]
      });
      return mockUnsubscribe;
    });

    const unsubscribe = firestoreService.subscribeToGames(mockUserId, callback);

    expect(collection).toHaveBeenCalledWith(mockDb, 'users', mockUserId, 'savedGames');
    expect(query).toHaveBeenCalledWith('mock-col-ref');
    expect(onSnapshot).toHaveBeenCalledWith('mock-query', expect.any(Function), expect.any(Function));
    expect(callback).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ id: 'g1' })
    ]));

    unsubscribe();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
