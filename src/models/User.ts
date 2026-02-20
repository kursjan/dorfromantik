/**
 * Represents a user in the system.
 */
export class User {
  /**
   * Creates a new User.
   * @param id - The unique identifier for the user (e.g., Firebase UID).
   * @throws Error if the id is empty.
   */
  constructor(public readonly id: string) {
    if (!id || id.trim() === '') {
      throw new Error('User ID cannot be empty');
    }
  }
}
