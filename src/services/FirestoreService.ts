import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
} from 'firebase/firestore';
import { db } from './firebase';
import { GameSerializer } from '../models/GameSerializer';
import { Game } from '../models/Game';
import { SAVED_GAME_VERSION, type SavedGameDoc } from './firestore-types';

const isMockAuth = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

let mockSavedGames: Map<string, Map<string, SavedGameDoc>> = new Map();

/**
 * Service for persisting and loading game state from Firestore.
 * In mock mode (CI/E2E), uses an in-memory store instead.
 */
export class FirestoreService {
  static async saveGameState(userId: string, game: Game): Promise<void> {
    const savedGame: SavedGameDoc = {
      version: SAVED_GAME_VERSION,
      gameId: game.id,
      userId,
      gameState: GameSerializer.serialize(game),
      savedAt: new Date().toISOString(),
    };

    if (isMockAuth) {
      if (!mockSavedGames.has(userId)) {
        mockSavedGames.set(userId, new Map());
      }
      mockSavedGames.get(userId)!.set(game.id, savedGame);
      return;
    }

    const ref = doc(db, 'users', userId, 'savedGames', game.id);
    await setDoc(ref, savedGame);
  }

  static async loadGameState(userId: string, gameId: string): Promise<Game | null> {
    if (isMockAuth) {
      const saved = mockSavedGames.get(userId)?.get(gameId);
      return saved ? GameSerializer.deserialize(saved.gameState) : null;
    }

    const ref = doc(db, 'users', userId, 'savedGames', gameId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return GameSerializer.deserialize((snap.data() as SavedGameDoc).gameState);
  }

  static async loadAllGames(userId: string): Promise<Game[]> {
    if (isMockAuth) {
      const userGames = mockSavedGames.get(userId);
      if (!userGames) return [];
      return Array.from(userGames.values()).map(d =>
        GameSerializer.deserialize(d.gameState)
      );
    }

    const colRef = collection(db, 'users', userId, 'savedGames');
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map(d =>
      GameSerializer.deserialize((d.data() as SavedGameDoc).gameState)
    );
  }

  /** Reset in-memory mock store. Test-only. */
  static _resetMockStore(): void {
    mockSavedGames = new Map();
  }
}
