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
        return Navigation.north(coord);
      case 'northEast':
        return Navigation.northEast(coord);
      case 'southEast':
        return Navigation.southEast(coord);
      case 'south':
        return Navigation.south(coord);
      case 'southWest':
        return Navigation.southWest(coord);
      case 'northWest':
        return Navigation.northWest(coord);
    }
  }

  getNeighbors(coord: HexCoordinate): NeighborInfo[] {
    return this.directions.map((direction) => ({
      direction,
      coordinate: this.getNeighbor(coord, direction),
    }));
  }

  static north(coord: HexCoordinate): HexCoordinate {
    return new HexCoordinate(coord.q - 1, coord.r, coord.s + 1);
  }

  static northEast(coord: HexCoordinate): HexCoordinate {
    return new HexCoordinate(coord.q - 1, coord.r + 1, coord.s);
  }

  static southEast(coord: HexCoordinate): HexCoordinate {
    return new HexCoordinate(coord.q, coord.r + 1, coord.s - 1);
  }

  static south(coord: HexCoordinate): HexCoordinate {
    return new HexCoordinate(coord.q + 1, coord.r, coord.s - 1);
  }

  static southWest(coord: HexCoordinate): HexCoordinate {
    return new HexCoordinate(coord.q + 1, coord.r - 1, coord.s);
  }

  static northWest(coord: HexCoordinate): HexCoordinate {
    return new HexCoordinate(coord.q, coord.r - 1, coord.s + 1);
  }
}
