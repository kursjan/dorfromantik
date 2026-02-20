import { describe, it, expect } from 'vitest';
import { User } from './User';

describe('User', () => {
  it('should create a user with a valid ID', () => {
    const userId = 'user-123';
    const user = new User(userId);
    expect(user.id).toBe(userId);
  });

  it('should throw an error if the ID is empty', () => {
    expect(() => new User('')).toThrow('User ID cannot be empty');
  });
});
