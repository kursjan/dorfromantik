export abstract class User {
  readonly id: string;

  constructor(id: string) {
    if (!id || id.trim() === '') {
      throw new Error('User ID cannot be empty');
    }
    this.id = id;
  }

  abstract get isAnonymous(): boolean;
}

/**
 * Represents a guest user who hasn't linked a permanent account.
 */
export class AnonymousUser extends User {
  constructor(id: string) {
    super(id);
  }

  get isAnonymous(): boolean {
    return true;
  }
}

/**
 * Represents a user who has linked a permanent account (e.g., via Google).
 */
export class RegisteredUser extends User {
  readonly displayName: string;

  constructor(id: string, displayName: string) {
    super(id);
    if (!displayName || displayName.trim() === '') {
      throw new Error('RegisteredUser displayName cannot be empty');
    }
    this.displayName = displayName;
  }

  get isAnonymous(): boolean {
    return false;
  }
}
