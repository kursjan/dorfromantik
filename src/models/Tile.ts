import type { Direction } from './Navigation';

export const TERRAIN_TYPES = ['tree', 'house', 'water', 'pasture', 'rail', 'field'] as const;
export type TerrainType = (typeof TERRAIN_TYPES)[number];

export interface TileOptions {
  id?: string;
  north?: TerrainType;
  northEast?: TerrainType;
  southEast?: TerrainType;
  south?: TerrainType;
  southWest?: TerrainType;
  northWest?: TerrainType;
}

export class Tile {
  private static idCounter = 0;

  readonly type = 'tile';
  readonly id: string;
  readonly north: TerrainType;
  readonly northEast: TerrainType;
  readonly southEast: TerrainType;
  readonly south: TerrainType;
  readonly southWest: TerrainType;
  readonly northWest: TerrainType;

  constructor(options: TileOptions = {}) {
    this.id = options.id ?? `tile-${Date.now()}-${Tile.idCounter++}`;
    this.north = options.north ?? 'pasture';
    this.northEast = options.northEast ?? 'pasture';
    this.southEast = options.southEast ?? 'pasture';
    this.south = options.south ?? 'pasture';
    this.southWest = options.southWest ?? 'pasture';
    this.northWest = options.northWest ?? 'pasture';
  }

  /**
   * Returns a map of all directions to their terrain types.
   */
  getTerrains(): Record<Direction, TerrainType> {
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
  getTerrain(direction: Direction): TerrainType {
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
      north: this.northWest,
      northEast: this.north,
      southEast: this.northEast,
      south: this.southEast,
      southWest: this.south,
      northWest: this.southWest,
    });
  }

  private getTerrainChar(type: TerrainType): string {
    return type[0].toUpperCase();
  }

  print(): string {
    const terrains = this.getTerrains();
    const n = this.getTerrainChar(terrains.north);
    const ne = this.getTerrainChar(terrains.northEast);
    const se = this.getTerrainChar(terrains.southEast);
    const s = this.getTerrainChar(terrains.south);
    const sw = this.getTerrainChar(terrains.southWest);
    const nw = this.getTerrainChar(terrains.northWest);

    return `Tile ${this.id}:
    _ _
  /  ${n}  \\
 /${nw}     ${ne}\\
 \\${sw}     ${se}/
  \\ _${s}_ /`;
  }
}
