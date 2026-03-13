import { describe, it, expect, beforeEach, vi } from 'vitest';

import { MockAuthService } from './auth/MockAuthService';

describe('MockAuthService', () => {
  const mockAuthService = new MockAuthService();

  beforeEach(() => {
    mockAuthService._resetMockStore();
  });

  it('signs in anonymously and returns a stable uid', async () => {
    const uid = await mockAuthService.signInAnonymously();
    expect(uid).toBe('mock-anon-123');
  });

  it('signs in with Google and returns same uid', async () => {
    const uid = await mockAuthService.signInWithGoogle();
    expect(uid).toBe('mock-anon-123');
  });

  it('signs out and clears current user', async () => {
    await mockAuthService.signInAnonymously();
    await mockAuthService.signOut();
    const uid = await mockAuthService.getCurrentUser();
    expect(uid).toBeNull();
  });

  it('invokes auth state listener with current uid', async () => {
    await mockAuthService.signInAnonymously();
    const callback = vi.fn();

    const unsubscribe = mockAuthService.onAuthStateChanged(callback);
    await new Promise((resolve) => setTimeout(resolve, 0));
    unsubscribe();

    expect(callback).toHaveBeenCalledWith('mock-anon-123');
  });

  it('returns current user uid when logged in', async () => {
    await mockAuthService.signInAnonymously();
    const uid = await mockAuthService.getCurrentUser();
    expect(uid).toBe('mock-anon-123');
  });
});
