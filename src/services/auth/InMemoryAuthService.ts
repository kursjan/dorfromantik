import type { IAuthService } from "./IAuthService";

// Mock Auth State
let mockUser: { uid: string; isAnonymous: boolean; displayName: string | null } | null = null;
let authListeners: ((userId: string | null) => void)[] = [];

const notifyListeners = () => {
  authListeners.forEach((l) => l(mockUser?.uid || null));
};

/**
 * In-memory implementation of IAuthService for non-Firebase environments.
 * 
 * This FAKE implementation provides a lightweight alternative to Firebase Auth
 * with real behavioral logic. It's used in production when VITE_USE_MOCK_AUTH=true.
 * 
 * This allows the app to run without Firebase dependencies in:
 * - CI/CD environments
 * - E2E tests
 * - Local development
 * - Testing scenarios
 */
export class InMemoryAuthService implements IAuthService {
  async signInAnonymously(): Promise<string> {
    mockUser = { uid: 'mock-anon-123', isAnonymous: true, displayName: null };
    notifyListeners();
    return mockUser.uid;
  }

  async signInWithGoogle(): Promise<string> {
    mockUser = { uid: 'mock-anon-123', isAnonymous: false, displayName: 'Test User' };
    notifyListeners();
    return mockUser.uid;
  }

  async signOut(): Promise<void> {
    mockUser = null;
    notifyListeners();
  }

  async getCurrentUser(): Promise<string | null> {
    return mockUser?.uid || null;
  }

  onAuthStateChanged(callback: (userId: string | null) => void): () => void {
    authListeners.push(callback);
    // Trigger immediately like Firebase does
    setTimeout(() => callback(mockUser?.uid || null), 0);
    return () => {
      authListeners = authListeners.filter((l) => l !== callback);
    };
  }

  /**
   * Resets the mock state (for testing).
   */
  _resetMockStore(): void {
    mockUser = null;
    authListeners = [];
  }
}
