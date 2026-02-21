import { Tile, type TerrainType } from './Tile';

export interface InitialTileSpec {
  north: TerrainType;
  northEast: TerrainType;
  southEast: TerrainType;
  south: TerrainType;
  southWest: TerrainType;
  northWest: TerrainType;
}

export interface GameRulesOptions {
  initialTurns?: number;
  pointsPerMatch?: number;
  initialTile?: InitialTileSpec;
}

/**
 * Defines the rules and initial settings for a game.
 */
export class GameRules {
  readonly initialTurns: number;
  readonly pointsPerMatch: number;
  readonly initialTile?: InitialTileSpec;

  /**
   * Creates a new instance of GameRules.
   * @param options - Optional configuration for game rules.
   */
  constructor(options: GameRulesOptions = {}) {
    this.initialTurns = options.initialTurns ?? 40;
    this.pointsPerMatch = options.pointsPerMatch ?? 10;
    this.initialTile = options.initialTile;

    if (this.initialTurns < 0) {
      throw new Error('initialTurns must be non-negative');
    }
    if (this.pointsPerMatch < 0) {
      throw new Error('pointsPerMatch must be non-negative');
    }
  }

  /**
   * Creates a standard GameRules instance with default settings (30 turns, pasture starter).
   */
  static createStandard(): GameRules {
    return new GameRules({
      initialTurns: 30,
      pointsPerMatch: 10,
      initialTile: {
        north: 'pasture',
        northEast: 'pasture',
        southEast: 'pasture',
        south: 'pasture',
        southWest: 'pasture',
        northWest: 'pasture',
      },
    });
  }

  /**
   * Creates the initial tile based on the rules.
   */
  createInitialTile(id: string = 'start-tile'): Tile {
    const spec = this.initialTile ?? {
      north: 'pasture',
      northEast: 'pasture',
      southEast: 'pasture',
      south: 'pasture',
      southWest: 'pasture',
      northWest: 'pasture',
    };
    return new Tile({
      id,
      ...spec,
    });
  }
}
