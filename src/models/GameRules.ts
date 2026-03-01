import { Tile, TERRAIN_TYPES, type TerrainType } from './Tile';

export interface GameRulesOptions {
  initialTurns?: number;
  pointsPerMatch?: number;
  pointsPerPerfect?: number;
  turnsPerPerfect?: number;
  initialTileGenerator?: TileGenerator;
  tileGenerator?: TileGenerator;
}

/**
 * Defines the rules and initial settings for a game.
 */
export class GameRules {
  readonly initialTurns: number;
  readonly pointsPerMatch: number;
  readonly pointsPerPerfect: number;
  readonly turnsPerPerfect: number;

  readonly initialTileGenerator: TileGenerator;
  readonly tileGenerator: TileGenerator;

  /**
   * Creates a new instance of GameRules.
   * @param options - Optional configuration for game rules.
   */
  constructor(options: GameRulesOptions = {}) {
    this.initialTurns = options.initialTurns ?? 40;
    this.pointsPerMatch = options.pointsPerMatch ?? 10;
    this.pointsPerPerfect = options.pointsPerPerfect ?? 60;
    this.turnsPerPerfect = options.turnsPerPerfect ?? 1;
    this.initialTileGenerator = options.initialTileGenerator ?? new PastureTileGenerator();
    this.tileGenerator = options.tileGenerator ?? new RandomTileGenerator();

    if (this.initialTurns < 0) {
      throw new Error('initialTurns must be non-negative');
    }
    if (this.pointsPerMatch < 0) {
      throw new Error('pointsPerMatch must be non-negative');
    }
    if (this.pointsPerPerfect < 0) {
      throw new Error('pointsPerPerfect must be non-negative');
    }
    if (this.turnsPerPerfect < 0) {
      throw new Error('turnsPerPerfect must be non-negative');
    }
  }

  /**
   * Creates a standard GameRules instance with default settings (30 turns, pasture starter).
   */
  static createStandard(): GameRules {
    return new GameRules({
      initialTurns: 30,
      pointsPerMatch: 10,
      pointsPerPerfect: 60,
      turnsPerPerfect: 1,
      initialTileGenerator: new PastureTileGenerator(),
      tileGenerator: new RandomTileGenerator(),
    });
  }

  createInitialTile(id: string = 'start-tile'): Tile {
    return this.initialTileGenerator.createTile(id);
  }
}

/**
 * Interface for tile generator strategies.
 */
export interface TileGenerator {
  createTile(id?: string): Tile;
}

/**
 * Tile generator implementation for a standard all-pasture tile.
 */
export class PastureTileGenerator implements TileGenerator {
  createTile(id?: string): Tile {
    return new Tile({
      id,
      north: 'pasture',
      northEast: 'pasture',
      southEast: 'pasture',
      south: 'pasture',
      southWest: 'pasture',
      northWest: 'pasture',
    });
  }
}

export class RandomTileGenerator implements TileGenerator {
  private static counter = 0;

  createTile(id?: string): Tile {
    const finalId = id ?? this.generateId();
    return new Tile({
      id: finalId,
      north: this.getRandomTerrain(),
      northEast: this.getRandomTerrain(),
      southEast: this.getRandomTerrain(),
      south: this.getRandomTerrain(),
      southWest: this.getRandomTerrain(),
      northWest: this.getRandomTerrain(),
    });
  }

  private getRandomTerrain(): TerrainType {
    const index = Math.floor(Math.random() * TERRAIN_TYPES.length);
    return TERRAIN_TYPES[index];
  }

  /**
   * Generates a unique tile ID using a counter and a random alphanumeric string.
   * This helps ensure that each tile created has a distinct identifier without relying on Date.now().
   * @returns A unique string ID for a tile, e.g. "tile-gen-42-xk8p2f"
   */
  private generateId(): string {
    const randomPart = Math.random().toString(36).slice(2, 8);
    return `tile-gen-${RandomTileGenerator.counter++}-${randomPart}`;
  }
}

/**
 * Tile generator that yields a predefined sequence of tiles.
 * Useful for testing or deterministic scenarios.
 */
export class SequenceTileGenerator implements TileGenerator {
  private tiles: Tile[];
  private currentIndex = 0;

  constructor(tiles: Tile[]) {
    this.tiles = tiles;
  }

  createTile(): Tile {
    if (this.currentIndex >= this.tiles.length) {
      throw new Error('SequenceTileGenerator: No more tiles in sequence');
    }
    return this.tiles[this.currentIndex++];
  }
}
