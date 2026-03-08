import { describe, it, expect } from 'vitest';
import { User } from './User';

describe('User', () => {
  it('should create a user with a valid ID and default anonymous status', () => {
    const userId = 'user-123';
    const user = new User(userId);
    expect(user.id).toBe(userId);
    expect(user.isAnonymous).toBe(true);
    expect(user.displayName).toBeUndefined();
  });

  it('should create a user with explicit anonymous status and display name', () => {
    const user = new User('user-456', false, 'Test Player');
    expect(user.id).toBe('user-456');
    expect(user.isAnonymous).toBe(false);
    expect(user.displayName).toBe('Test Player');
  });

  it('should throw an error if the ID is empty', () => {
    expect(() => new User('')).toThrow('User ID cannot be empty');
  });
});
