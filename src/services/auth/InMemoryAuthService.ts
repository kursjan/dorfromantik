import type { IAuthService, AuthUser } from "./IAuthService";

// Mock Auth State
let mockUser: AuthUser | null = null;
let authListeners: ((user: AuthUser | null) => void)[] = [];

const notifyListeners = () => {
  authListeners.forEach((l) => l(mockUser));
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
  async signInAnonymously(): Promise<AuthUser> {
    mockUser = { uid: 'mock-anon-123', isAnonymous: true, displayName: null };
    notifyListeners();
    return mockUser;
  }

  async signInWithGoogle(): Promise<AuthUser> {
    mockUser = { uid: 'mock-anon-123', isAnonymous: false, displayName: 'Test User' };
    notifyListeners();
    return mockUser;
  }

  async signOut(): Promise<void> {
    mockUser = null;
    notifyListeners();
  }

  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    authListeners.push(callback);
    // Trigger immediately like Firebase does
    callback(mockUser);
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
