export type TerrainType = 'tree' | 'house' | 'water' | 'pasture' | 'rail' | 'field';

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
  id: string;
  north: TerrainType;
  northEast: TerrainType;
  southEast: TerrainType;
  south: TerrainType;
  southWest: TerrainType;
  northWest: TerrainType;

  constructor(props: TileProps) {
    this.id = props.id;
    this.north = props.north;
    this.northEast = props.northEast;
    this.southEast = props.southEast;
    this.south = props.south;
    this.southWest = props.southWest;
    this.northWest = props.northWest;
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
