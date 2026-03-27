import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.hoisted(() => {
  vi.stubEnv('VITE_USE_MOCK_AUTH', '');
});

import { FirebaseAuthService } from './FirebaseAuthService';
import {
  signInAnonymously,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
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
vi.mock('../firebase', () => ({
  auth: mockAuth,
}));

describe('FirebaseAuthService', () => {
  const authService = new FirebaseAuthService();

  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.currentUser = null;
  });

  it('signs in anonymously and returns AuthUser', async () => {
    const mockUser = { uid: 'anonymous-uid', isAnonymous: true, displayName: null };
    (signInAnonymously as any).mockResolvedValue({ user: mockUser });

    const user = await authService.signInAnonymously();

    expect(signInAnonymously).toHaveBeenCalledWith(mockAuth);
    expect(user.uid).toBe('anonymous-uid');
    expect(user.isAnonymous).toBe(true);
  });

  it('signs in with Google and returns AuthUser', async () => {
    const mockUser = { uid: 'google-uid', isAnonymous: false, displayName: 'Test User' };
    (signInWithPopup as any).mockResolvedValue({ user: mockUser });

    const user = await authService.signInWithGoogle();

    expect(GoogleAuthProvider).toHaveBeenCalledTimes(1);
    expect(signInWithPopup).toHaveBeenCalled();
    expect(user.uid).toBe('google-uid');
    expect(user.displayName).toBe('Test User');
  });

  it('signs out current user', async () => {
    (signOut as any).mockResolvedValue(undefined);

    await authService.signOut();

    expect(signOut).toHaveBeenCalledWith(mockAuth);
  });

  it('registers auth state changed listener', () => {
    const callback = vi.fn();
    (onAuthStateChanged as any).mockImplementation((_auth: any, cb: (user: { uid: string; isAnonymous: boolean; displayName: string | null } | null) => void) => {
      cb({ uid: 'test-uid', isAnonymous: true, displayName: null });
      return () => {};
    });

    const unsubscribe = authService.onAuthStateChanged(callback);
    unsubscribe();

    expect(onAuthStateChanged).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith(expect.objectContaining({ uid: 'test-uid' }));
  });
});
