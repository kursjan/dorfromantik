import type { Direction } from './Navigation';
import {
  TERRAIN_TYPES,
  type TerrainName,
  Terrain,
  toTerrain,
} from './Terrain';
import { TileValidator } from './TileValidator';

export { TERRAIN_TYPES };
export type TerrainType = TerrainName;
export type TerrainEntity = Terrain;

export interface TileTerrainOptions {
  id?: string;
  center?: Terrain;
  north?: Terrain;
  northEast?: Terrain;
  southEast?: Terrain;
  south?: Terrain;
  southWest?: Terrain;
  northWest?: Terrain;
}

/**
 * @deprecated Use `TileTerrainOptions` and pass `Terrain` objects instead.
 */
export interface TileTerrainNameOptions {
  id?: string;
  center?: TerrainName;
  north?: TerrainName;
  northEast?: TerrainName;
  southEast?: TerrainName;
  south?: TerrainName;
  southWest?: TerrainName;
  northWest?: TerrainName;
}

export class Tile {
  private static idCounter = 0;
  private static validator = new TileValidator();

  readonly type = 'tile';
  readonly id: string;
  readonly center?: Terrain;
  readonly north: Terrain;
  readonly northEast: Terrain;
  readonly southEast: Terrain;
  readonly south: Terrain;
  readonly southWest: Terrain;
  readonly northWest: Terrain;

  constructor(options?: TileTerrainOptions);
  /**
   * @deprecated Use `new Tile({ ...Terrain objects... })` instead of terrain names.
   */
  constructor(options?: TileTerrainNameOptions);
  constructor(options: TileTerrainOptions | TileTerrainNameOptions = {}) {
    this.id = options.id ?? `tile-${Date.now()}-${Tile.idCounter++}`;
    this.center = this.toOptionalTerrain(options.center);
    this.north = this.toRequiredTerrain(options.north);
    this.northEast = this.toRequiredTerrain(options.northEast);
    this.southEast = this.toRequiredTerrain(options.southEast);
    this.south = this.toRequiredTerrain(options.south);
    this.southWest = this.toRequiredTerrain(options.southWest);
    this.northWest = this.toRequiredTerrain(options.northWest);
    Tile.validator.validate(this);
  }

  private toRequiredTerrain(input: Terrain | TerrainName | undefined): Terrain {
    return toTerrain(input ?? 'pasture');
  }

  private toOptionalTerrain(input: Terrain | TerrainName | undefined): Terrain | undefined {
    return input ? toTerrain(input) : undefined;
  }

  /**
   * Returns a map of all directions to their terrain types.
   */
  getTerrains(): Record<Direction, Terrain> {
    return {
      north: this.north,
      northEast: this.northEast,
      southEast: this.southEast,
      south: this.south,
      southWest: this.southWest,
      northWest: this.northWest,
    };
  }

  /**
   * Returns the terrain type for a specific direction on this tile.
   */
  getTerrain(direction: Direction): Terrain {
    return this.getTerrains()[direction];
  }

  /**
   * Returns a new Tile rotated 60 degrees clockwise.
   * According to spec: North -> NorthWest, NorthEast -> North, etc.
   *
   * NOTE: The 'id' is intentionally preserved during rotation. This ensures
   * that React (or other UI layers) can maintain the tile's identity across
   * rotations, enabling smooth animations (like CSS transforms) rather than
   * full component re-mounts.
   */
  rotateClockwise(): Tile {
    return new Tile({
      id: this.id,
      center: this.center,
      north: this.northEast,
      northEast: this.southEast,
      southEast: this.south,
      south: this.southWest,
      southWest: this.northWest,
      northWest: this.north,
    });
  }

  /**
   * Returns a new Tile rotated 60 degrees counter-clockwise.
   * According to spec: North -> NorthEast, NorthEast -> SouthEast, etc.
   *
   * NOTE: The 'id' is intentionally preserved during rotation. This ensures
   * that React (or other UI layers) can maintain the tile's identity across
   * rotations, enabling smooth animations (like CSS transforms) rather than
   * full component re-mounts.
   */
  rotateCounterClockwise(): Tile {
    return new Tile({
      id: this.id,
      center: this.center,
      north: this.northWest,
      northEast: this.north,
      southEast: this.northEast,
      south: this.southEast,
      southWest: this.south,
      northWest: this.southWest,
    });
  }

  private getTerrainChar(type: Terrain): string {
    return type.shortCode;
  }

  print(): string {
    const terrains = this.getTerrains();
    const n = this.getTerrainChar(terrains.north);
    const ne = this.getTerrainChar(terrains.northEast);
    const se = this.getTerrainChar(terrains.southEast);
    const s = this.getTerrainChar(terrains.south);
    const sw = this.getTerrainChar(terrains.southWest);
    const nw = this.getTerrainChar(terrains.northWest);
    const c = this.center ? this.getTerrainChar(this.center) : ' ';

    return `Tile ${this.id}:
    _ _
  /  ${n}  \\
 /${nw}  ${c}  ${ne}\\
 \\${sw}     ${se}/
  \\ _${s}_ /`;
  }
}
