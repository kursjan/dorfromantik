export interface GameRulesOptions {
  initialTurns?: number;
  pointsPerMatch?: number;
}

/**
 * Defines the rules and initial settings for a game.
 */
export class GameRules {
  readonly initialTurns: number;
  readonly pointsPerMatch: number;

  /**
   * Creates a new instance of GameRules.
   * @param options - Optional configuration for game rules.
   */
  constructor(options: GameRulesOptions = {}) {
    const initialTurns = options.initialTurns ?? 40;
    const pointsPerMatch = options.pointsPerMatch ?? 10;

    if (initialTurns < 0) {
      throw new Error('initialTurns must be non-negative');
    }
    if (pointsPerMatch < 0) {
      throw new Error('pointsPerMatch must be non-negative');
    }

    this.initialTurns = initialTurns;
    this.pointsPerMatch = pointsPerMatch;
  }
}
