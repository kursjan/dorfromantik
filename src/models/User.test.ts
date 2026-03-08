import { describe, it, expect } from 'vitest';
import { AnonymousUser, RegisteredUser } from './User';

describe('User', () => {
  it('should create an AnonymousUser with a valid ID', () => {
    const userId = 'guest-123';
    const user = new AnonymousUser(userId);
    expect(user.id).toBe(userId);
    expect(user.isAnonymous).toBe(true);
    expect(user.displayName).toBeUndefined();
  });

  it('should create a RegisteredUser with a valid ID and display name', () => {
    const user = new RegisteredUser({ id: 'user-456', displayName: 'Test Player' });
    expect(user.id).toBe('user-456');
    expect(user.isAnonymous).toBe(false);
    expect(user.displayName).toBe('Test Player');
  });

  it('should throw an error if the ID is empty for AnonymousUser', () => {
    expect(() => new AnonymousUser('')).toThrow('User ID cannot be empty');
  });

  it('should throw an error if the ID is empty for RegisteredUser', () => {
    expect(() => new RegisteredUser({ id: '' })).toThrow('User ID cannot be empty');
  });
});
