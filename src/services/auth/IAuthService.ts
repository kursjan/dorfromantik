// src/services/auth/IAuthService.ts

/**
 * Interface for AuthService, defining core authentication operations.
 * 
 * Implementations:
 * - FirebaseAuthService: Real Firebase implementation (production)
 * - MockAuthService: In-memory fake implementation (non-Firebase environments)
 */
export interface IAuthService {
  /**
   * Signs in a user anonymously.
   * @returns Promise resolving to the user's UID.
   */
  signInAnonymously(): Promise<string>;

  /**
   * Signs in a user with Google.
   * @returns Promise resolving to the user's UID.
   */
  signInWithGoogle(): Promise<string>;

  /**
   * Signs out the current user.
   * @returns Promise resolving when sign-out is complete.
   */
  signOut(): Promise<void>;

  /**
   * Gets the current user's UID, or `null` if no user is signed in.
   * @returns Promise resolving to the user's UID or `null`.
   */
  getCurrentUser(): Promise<string | null>;

  /**
   * Registers a callback for auth state changes.
   * @param callback - Function to call when auth state changes.
   * @returns Unsubscribe function.
   */
  onAuthStateChanged(callback: (userId: string | null) => void): () => void;
}
