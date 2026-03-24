// src/services/firestore/FirebaseFirestoreService.ts
import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  onSnapshot,
  query,
} from 'firebase/firestore';
import { db } from '../firebase';
import { GameSerializer } from '../../models/GameSerializer';
import { Game } from '../../models/Game';
import { SAVED_GAME_VERSION, type SavedGameDoc } from './firestore-types';
import type { IFirestoreService } from './IFirestoreService';

/**
 * Firebase implementation of IFirestoreService.
 */
export class FirebaseFirestoreService implements IFirestoreService {
  async saveGameState(userId: string, game: Game): Promise<void> {
    const savedGame: SavedGameDoc = {
      version: SAVED_GAME_VERSION,
      gameId: game.id,
      userId,
      gameState: GameSerializer.serialize(game),
      savedAt: new Date().toISOString(),
    };

    const ref = doc(db, 'users', userId, 'savedGames', game.id);
    await setDoc(ref, savedGame);
  }

  async loadGameState(userId: string, gameId: string): Promise<Game | null> {
    const ref = doc(db, 'users', userId, 'savedGames', gameId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return GameSerializer.deserialize((snap.data() as SavedGameDoc).gameState);
  }

  async loadAllGames(userId: string): Promise<Game[]> {
    const colRef = collection(db, 'users', userId, 'savedGames');
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map(d =>
      GameSerializer.deserialize((d.data() as SavedGameDoc).gameState)
    );
  }

  subscribeToGames(userId: string, callback: (games: Game[]) => void): () => void {
    const colRef = collection(db, 'users', userId, 'savedGames');
    const q = query(colRef);
    
    return onSnapshot(q, (snapshot) => {
      const games = snapshot.docs.map(d =>
        GameSerializer.deserialize((d.data() as SavedGameDoc).gameState)
      );
      callback(games);
    }, (error) => {
      console.error('Error subscribing to games:', error);
    });
  }
}
