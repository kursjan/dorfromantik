import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.hoisted(() => {
  vi.stubEnv('VITE_USE_MOCK_AUTH', '');
});

import { AuthService } from './AuthService';
import { 
  signInAnonymously, 
  signInWithPopup,
  linkWithPopup,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';

// Mock Firebase Auth
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  signInAnonymously: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  signInWithPopup: vi.fn(),
  linkWithPopup: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
}));

// Mock our local firebase initialization to avoid actual side effects
const mockAuth = vi.hoisted(() => ({ currentUser: null as any }));
vi.mock('./firebase', () => ({
  auth: mockAuth,
}));

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should sign in anonymously', async () => {
    const mockUser = { uid: 'anonymous-uid' };
    (signInAnonymously as any).mockResolvedValue({ user: mockUser });

    const user = await AuthService.signInAnonymously();

    expect(signInAnonymously).toHaveBeenCalled();
    expect(user.uid).toBe('anonymous-uid');
  });

  it('should sign in with Google', async () => {
    const mockUser = { uid: 'google-uid', displayName: 'Test User' };
    (signInWithPopup as any).mockResolvedValue({ user: mockUser });

    const user = await AuthService.signInWithGoogle();

    expect(signInWithPopup).toHaveBeenCalled();
    expect(user.uid).toBe('google-uid');
  });

  it('should sign out', async () => {
    (signOut as any).mockResolvedValue(undefined);

    await AuthService.signOut();

    expect(signOut).toHaveBeenCalled();
  });

  it('should register auth state changed listener', () => {
    const callback = vi.fn();
    (onAuthStateChanged as any).mockReturnValue(() => {});

    AuthService.onAuthStateChanged(callback);

    expect(onAuthStateChanged).toHaveBeenCalledWith(expect.anything(), callback);
  });

  // Regression: linkWithPopup was disabled because the re-auth cycle
  // (link -> logout -> login) throws credential-already-in-use.
  // See AuthService.ts signInWithGoogle for details.
  it('should use signInWithPopup, not linkWithPopup, even for anonymous users', async () => {
    mockAuth.currentUser = { uid: 'anon-uid', isAnonymous: true };
    const mockUser = { uid: 'google-uid', displayName: 'Test User' };
    (signInWithPopup as any).mockResolvedValue({ user: mockUser });

    await AuthService.signInWithGoogle();

    expect(signInWithPopup).toHaveBeenCalled();
    expect(linkWithPopup).not.toHaveBeenCalled();
  });
});
