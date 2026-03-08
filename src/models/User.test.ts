import { describe, it, expect } from 'vitest';
import { AnonymousUser, RegisteredUser } from './User';

describe('User Polymorphism', () => {
  describe('AnonymousUser', () => {
    it('should create an AnonymousUser with a valid ID', () => {
      const user = new AnonymousUser('guest-123');
      expect(user.id).toBe('guest-123');
      expect(user.isAnonymous).toBe(true);
      // @ts-expect-error - displayName should not exist on AnonymousUser
      expect(user.displayName).toBeUndefined();
    });

    it('should throw an error if the ID is empty', () => {
      expect(() => new AnonymousUser('')).toThrow('User ID cannot be empty');
    });
  });

  describe('RegisteredUser', () => {
    it('should create a RegisteredUser with a valid ID and display name', () => {
      const user = new RegisteredUser('user-456', 'Test Player');
      expect(user.id).toBe('user-456');
      expect(user.isAnonymous).toBe(false);
      expect(user.displayName).toBe('Test Player');
    });

    it('should create a RegisteredUser without a display name', () => {
      const user = new RegisteredUser('user-789');
      expect(user.id).toBe('user-789');
      expect(user.isAnonymous).toBe(false);
      expect(user.displayName).toBeUndefined();
    });

    it('should throw an error if the ID is empty', () => {
      expect(() => new RegisteredUser('')).toThrow('User ID cannot be empty');
    });
  });
});
