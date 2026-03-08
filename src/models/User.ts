export interface UserProps {
  id: string;
  displayName?: string | null;
}

/**
 * Represents a user in the system.
 */
export abstract class User {
  readonly id: string;
  readonly displayName?: string | null;

  constructor(props: UserProps) {
    if (!props.id || props.id.trim() === '') {
      throw new Error('User ID cannot be empty');
    }
    this.id = props.id;
    this.displayName = props.displayName;
  }

  abstract get isAnonymous(): boolean;
}

/**
 * Represents a guest user who hasn't linked a permanent account.
 */
export class AnonymousUser extends User {
  constructor(id: string) {
    super({ id });
  }

  get isAnonymous(): boolean {
    return true;
  }
}

/**
 * Represents a user who has linked a permanent account (e.g., via Google).
 */
export class RegisteredUser extends User {
  constructor(props: UserProps) {
    super(props);
  }

  get isAnonymous(): boolean {
    return false;
  }
}
