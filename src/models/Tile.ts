import { Direction } from './Navigation';

export const TERRAIN_TYPES = ['tree', 'house', 'water', 'pasture', 'rail', 'field'] as const;
export type TerrainType = (typeof TERRAIN_TYPES)[number];

export interface TileProps {
  id: string;
  north: TerrainType;
  northEast: TerrainType;
  southEast: TerrainType;
  south: TerrainType;
  southWest: TerrainType;
  northWest: TerrainType;
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

  constructor(props: TileProps) {
    this.id = props.id;
    this.north = props.north;
    this.northEast = props.northEast;
    this.southEast = props.southEast;
    this.south = props.south;
    this.southWest = props.southWest;
    this.northWest = props.northWest;
  }

  /**
   * Creates a new Tile with random terrains for each side.
   * @param id - Unique identifier for the tile.
   * @returns A new Tile instance.
   */
  static createRandom(id: string): Tile {
    const getRandom = () => TERRAIN_TYPES[Math.floor(Math.random() * TERRAIN_TYPES.length)];

    return new Tile({
      id,
      north: getRandom(),
      northEast: getRandom(),
      southEast: getRandom(),
      south: getRandom(),
      southWest: getRandom(),
      northWest: getRandom(),
    });
  }

  /**
   * Returns the terrain type for a specific direction on this tile.
   */
  getTerrain(direction: Direction): TerrainType {
    switch (direction) {
      case 'north':
        return this.north;
      case 'northEast':
        return this.northEast;
      case 'southEast':
        return this.southEast;
      case 'south':
        return this.south;
      case 'southWest':
        return this.southWest;
      case 'northWest':
        return this.northWest;
      default:
        throw new Error(`Invalid direction: ${direction}`);
    }
  }

  private getTerrainChar(type: TerrainType): string {
    return type[0].toUpperCase();
  }

  print(): void {
    const n = this.getTerrainChar(this.north);
    const ne = this.getTerrainChar(this.northEast);
    const se = this.getTerrainChar(this.southEast);
    const s = this.getTerrainChar(this.south);
    const sw = this.getTerrainChar(this.southWest);
    const nw = this.getTerrainChar(this.northWest);

    console.log(`Tile ${this.id}:`);
    console.log(`    _ _`);
    console.log(`  /  ${n}  \\`);
    console.log(` /${nw}     ${ne}\\`);
    console.log(` \\${sw}     ${se}/`);
    console.log(`  \\ _${s}_ /`);
  }
}
