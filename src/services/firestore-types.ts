import type { GameJSON } from '../models/GameSerializer';

/**
 * Firestore document stored at `users/{uid}`.
 * Tracks user identity and login metadata.
 */
export interface UserProfileDoc {
  uid: string;
  displayName: string | null;
  isAnonymous: boolean;
  createdAt: string;
  lastLoginAt: string;
}

/**
 * Firestore document stored at `users/{uid}/savedGames/{gameId}`.
 * Wraps the serialized game state with storage metadata.
 */
export interface SavedGameDoc {
  gameId: string;
  userId: string;
  gameState: GameJSON;
  savedAt: string;
}
