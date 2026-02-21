import { HexCoordinate } from './HexCoordinate';

export type Direction = 'north' | 'northEast' | 'southEast' | 'south' | 'southWest' | 'northWest';

export interface NeighborInfo {
  direction: Direction;
  coordinate: HexCoordinate;
}

export class Navigation {
  readonly directions: Direction[] = ['north', 'northEast', 'southEast', 'south', 'southWest', 'northWest'];

  getOpposite(direction: Direction): Direction {
    switch (direction) {
      case 'north':
        return 'south';
      case 'northEast':
        return 'southWest';
      case 'southEast':
        return 'northWest';
      case 'south':
        return 'north';
      case 'southWest':
        return 'northEast';
      case 'northWest':
        return 'southEast';
    }
  }

  getNeighbor(coord: HexCoordinate, direction: Direction): HexCoordinate {
    switch (direction) {
      case 'north':
        return this.north(coord);
      case 'northEast':
        return this.northEast(coord);
      case 'southEast':
        return this.southEast(coord);
      case 'south':
        return this.south(coord);
      case 'southWest':
        return this.southWest(coord);
      case 'northWest':
        return this.northWest(coord);
    }
  }

  getNeighbors(coord: HexCoordinate): NeighborInfo[] {
    return this.directions.map((direction) => ({
      direction,
      coordinate: this.getNeighbor(coord, direction),
    }));
  }

  north(coord: HexCoordinate): HexCoordinate {
    return new HexCoordinate(coord.q - 1, coord.r, coord.s + 1);
  }

  northEast(coord: HexCoordinate): HexCoordinate {
    return new HexCoordinate(coord.q - 1, coord.r + 1, coord.s);
  }

  southEast(coord: HexCoordinate): HexCoordinate {
    return new HexCoordinate(coord.q, coord.r + 1, coord.s - 1);
  }

  south(coord: HexCoordinate): HexCoordinate {
    return new HexCoordinate(coord.q + 1, coord.r, coord.s - 1);
  }

  southWest(coord: HexCoordinate): HexCoordinate {
    return new HexCoordinate(coord.q + 1, coord.r - 1, coord.s);
  }

  northWest(coord: HexCoordinate): HexCoordinate {
    return new HexCoordinate(coord.q, coord.r - 1, coord.s + 1);
  }
}
