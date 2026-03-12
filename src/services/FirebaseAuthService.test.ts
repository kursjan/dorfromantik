import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.hoisted(() => {
  vi.stubEnv('VITE_USE_MOCK_AUTH', '');
});

import { FirebaseAuthService } from './auth/FirebaseAuthService';
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
vi.mock('./firebase', () => ({
  auth: mockAuth,
}));

describe('FirebaseAuthService', () => {
  const authService = new FirebaseAuthService();

  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.currentUser = null;
  });

  it('signs in anonymously and returns uid', async () => {
    const mockUser = { uid: 'anonymous-uid' };
    (signInAnonymously as any).mockResolvedValue({ user: mockUser });

    const uid = await authService.signInAnonymously();

    expect(signInAnonymously).toHaveBeenCalledWith(mockAuth);
    expect(uid).toBe('anonymous-uid');
  });

  it('signs in with Google and returns uid', async () => {
    const mockUser = { uid: 'google-uid', displayName: 'Test User' };
    (signInWithPopup as any).mockResolvedValue({ user: mockUser });

    const uid = await authService.signInWithGoogle();

    expect(GoogleAuthProvider).toHaveBeenCalledTimes(1);
    expect(signInWithPopup).toHaveBeenCalled();
    expect(uid).toBe('google-uid');
  });

  it('signs out current user', async () => {
    (signOut as any).mockResolvedValue(undefined);

    await authService.signOut();

    expect(signOut).toHaveBeenCalledWith(mockAuth);
  });

  it('registers auth state changed listener', () => {
    const callback = vi.fn();
    (onAuthStateChanged as any).mockImplementation((_auth: any, cb: (user: { uid: string }) => void) => {
      cb({ uid: 'test-uid' });
      return () => {};
    });

    const unsubscribe = authService.onAuthStateChanged(callback);
    unsubscribe();

    expect(onAuthStateChanged).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith('test-uid');
  });

  it('returns current user uid when logged in', async () => {
    mockAuth.currentUser = { uid: 'test-uid' };
    const uid = await authService.getCurrentUser();
    expect(uid).toBe('test-uid');
  });

  it('returns null when no current user', async () => {
    mockAuth.currentUser = null;
    const uid = await authService.getCurrentUser();
    expect(uid).toBeNull();
  });
});
