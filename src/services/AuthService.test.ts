import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from './AuthService';
import { 
  signInAnonymously, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';

// Mock Firebase Auth
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  signInAnonymously: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
}));

// Mock our local firebase initialization to avoid actual side effects
vi.mock('./firebase', () => ({
  auth: {
    currentUser: null,
  },
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
});
