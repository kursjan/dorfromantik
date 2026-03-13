import { describe, it, expect, beforeEach, vi } from 'vitest';

import { InMemoryAuthService } from './auth/InMemoryAuthService';

describe('InMemoryAuthService (Fake Implementation)', () => {
  const inMemoryAuthService = new InMemoryAuthService();

  beforeEach(() => {
    inMemoryAuthService._resetMockStore();
  });

  it('signs in anonymously and returns a stable uid', async () => {
    const uid = await inMemoryAuthService.signInAnonymously();
    expect(uid).toBe('mock-anon-123');
  });

  it('signs in with Google and returns same uid', async () => {
    const uid = await inMemoryAuthService.signInWithGoogle();
    expect(uid).toBe('mock-anon-123');
  });

  it('signs out and clears current user', async () => {
    await inMemoryAuthService.signInAnonymously();
    await inMemoryAuthService.signOut();
    const uid = await inMemoryAuthService.getCurrentUser();
    expect(uid).toBeNull();
  });

  it('invokes auth state listener with current uid', async () => {
    await inMemoryAuthService.signInAnonymously();
    const callback = vi.fn();

    const unsubscribe = inMemoryAuthService.onAuthStateChanged(callback);
    await new Promise((resolve) => setTimeout(resolve, 0));
    unsubscribe();

    expect(callback).toHaveBeenCalledWith('mock-anon-123');
  });

  it('returns current user uid when logged in', async () => {
    await inMemoryAuthService.signInAnonymously();
    const uid = await inMemoryAuthService.getCurrentUser();
    expect(uid).toBe('mock-anon-123');
  });
});
