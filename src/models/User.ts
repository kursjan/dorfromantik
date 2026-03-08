/**
 * Represents a user in the system.
 */
export class User {
  readonly id: string;
  readonly isAnonymous: boolean;
  readonly displayName?: string | null;

  /**
   * Creates a new User.
   * @param id - The unique identifier for the user (e.g., Firebase UID).
   * @param isAnonymous - Whether the user is an anonymous guest.
   * @param displayName - The user's display name, if available.
   * @throws Error if the id is empty.
   */
  constructor(id: string, isAnonymous: boolean = true, displayName?: string | null) {
    if (!id || id.trim() === '') {
      throw new Error('User ID cannot be empty');
    }
    this.id = id;
    this.isAnonymous = isAnonymous;
    this.displayName = displayName;
  }
}
