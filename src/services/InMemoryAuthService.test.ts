import { describe, it, expect, beforeEach, vi } from 'vitest';

import { InMemoryAuthService } from './auth/InMemoryAuthService';

describe('InMemoryAuthService (Fake Implementation)', () => {
  const inMemoryAuthService = new InMemoryAuthService();

  beforeEach(() => {
    inMemoryAuthService._resetMockStore();
  });

  it('signs in anonymously and returns a stable uid', async () => {
    const user = await inMemoryAuthService.signInAnonymously();
    expect(user.uid).toBe('mock-anon-123');
    expect(user.isAnonymous).toBe(true);
  });

  it('signs in with Google and returns same uid', async () => {
    const user = await inMemoryAuthService.signInWithGoogle();
    expect(user.uid).toBe('mock-anon-123');
    expect(user.isAnonymous).toBe(false);
  });

  it('signs out and clears current user', async () => {
    await inMemoryAuthService.signInAnonymously();
    await inMemoryAuthService.signOut();
    const user = await inMemoryAuthService.getCurrentUser();
    expect(user).toBeNull();
  });

  it('invokes auth state listener with current user', async () => {
    await inMemoryAuthService.signInAnonymously();
    const callback = vi.fn();

    const unsubscribe = inMemoryAuthService.onAuthStateChanged(callback);
    await new Promise((resolve) => setTimeout(resolve, 0));
    unsubscribe();

    expect(callback).toHaveBeenCalledWith(expect.objectContaining({ uid: 'mock-anon-123' }));
  });

  it('returns current user when logged in', async () => {
    await inMemoryAuthService.signInAnonymously();
    const user = await inMemoryAuthService.getCurrentUser();
    expect(user?.uid).toBe('mock-anon-123');
  });
});
