import type { Direction } from './Navigation';

export const TERRAIN_TYPES = ['tree', 'house', 'water', 'pasture', 'rail', 'field'] as const;
export type TerrainType = (typeof TERRAIN_TYPES)[number];

export interface TileProps {
  id?: string;
  north?: TerrainType;
  northEast?: TerrainType;
  southEast?: TerrainType;
  south?: TerrainType;
  southWest?: TerrainType;
  northWest?: TerrainType;
}

export class Tile {
  readonly type = 'tile';
  readonly id: string;
  readonly north: TerrainType;
  readonly northEast: TerrainType;
  readonly southEast: TerrainType;
  readonly south: TerrainType;
  readonly southWest: TerrainType;
  readonly northWest: TerrainType;

  constructor(props: TileProps = {}) {
    this.id = props.id ?? `tile-${Date.now()}`;
    this.north = props.north ?? 'pasture';
    this.northEast = props.northEast ?? 'pasture';
    this.southEast = props.southEast ?? 'pasture';
    this.south = props.south ?? 'pasture';
    this.southWest = props.southWest ?? 'pasture';
    this.northWest = props.northWest ?? 'pasture';
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

  print(): void {
    const terrains = this.getTerrains();
    const n = this.getTerrainChar(terrains.north);
    const ne = this.getTerrainChar(terrains.northEast);
    const se = this.getTerrainChar(terrains.southEast);
    const s = this.getTerrainChar(terrains.south);
    const sw = this.getTerrainChar(terrains.southWest);
    const nw = this.getTerrainChar(terrains.northWest);

    console.log(`Tile ${this.id}:`);
    console.log(`    _ _`);
    console.log(`  /  ${n}  \\`);
    console.log(` /${nw}     ${ne}\\`);
    console.log(` \\${sw}     ${se}/`);
    console.log(`  \\ _${s}_ /`);
  }
}
