/**
 * Represents a user in the system.
 */
export class User {
  readonly id: string;

  /**
   * Creates a new User.
   * @param id - The unique identifier for the user (e.g., Firebase UID).
   * @throws Error if the id is empty.
   */
  constructor(id: string) {
    if (!id || id.trim() === '') {
      throw new Error('User ID cannot be empty');
    }
    this.id = id;
  }
}
