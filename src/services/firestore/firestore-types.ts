import type { GameJSON } from '../../models/GameSerializer';

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

/** Current schema version for SavedGameDoc. Increment when the shape changes. */
export const SAVED_GAME_VERSION = 1;

/**
 * Firestore document stored at `users/{uid}/savedGames/{gameId}`.
 * Wraps the serialized game state with storage metadata.
 */
export interface SavedGameDoc {
  version: number;
  gameId: string;
  userId: string;
  gameState: GameJSON;
  savedAt: string;
}
