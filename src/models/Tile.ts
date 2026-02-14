export type TerrainType = 'tree' | 'house' | 'water' | 'pasture' | 'rail' | 'field';

export interface TileProps {
  id: string;
  northEast: TerrainType;
  east: TerrainType;
  southEast: TerrainType;
  southWest: TerrainType;
  west: TerrainType;
  northWest: TerrainType;
}

export class Tile {
  readonly type = 'tile';
  id: string;
  northEast: TerrainType;
  east: TerrainType;
  southEast: TerrainType;
  southWest: TerrainType;
  west: TerrainType;
  northWest: TerrainType;

  constructor(props: TileProps) {
    this.id = props.id;
    this.northEast = props.northEast;
    this.east = props.east;
    this.southEast = props.southEast;
    this.southWest = props.southWest;
    this.west = props.west;
    this.northWest = props.northWest;
  }

  private getTerrainChar(type: TerrainType): string {
    return type[0];
  }

  print(): void {
    const nw = this.getTerrainChar(this.northWest);
    const ne = this.getTerrainChar(this.northEast);
    const w = this.getTerrainChar(this.west);
    const e = this.getTerrainChar(this.east);
    const sw = this.getTerrainChar(this.southWest);
    const se = this.getTerrainChar(this.southEast);

    console.log(`Tile ${this.id}:`);
    console.log(`   ${nw} -- ${ne}`);
    console.log(`  /      \\`);
    console.log(` ${w}        ${e}`);
    console.log(`  \\      /`);
    console.log(`   ${sw} -- ${se}`);
  }
}
