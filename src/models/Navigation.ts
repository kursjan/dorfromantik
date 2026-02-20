import { HexCoordinate } from './HexCoordinate';

export type Direction = 'north' | 'northEast' | 'southEast' | 'south' | 'southWest' | 'northWest';

export interface NeighborInfo {
  direction: Direction;
  coordinate: HexCoordinate;
}

export class Navigation {
  readonly directions: Direction[] = ['north', 'northEast', 'southEast', 'south', 'southWest', 'northWest'];

  private readonly opposites: Record<Direction, Direction> = {
    north: 'south',
    northEast: 'southWest',
    southEast: 'northWest',
    south: 'north',
    southWest: 'northEast',
    northWest: 'southEast',
  };

  getOpposite(direction: Direction): Direction {
    return this.opposites[direction];
  }

  getNeighbors(coord: HexCoordinate): NeighborInfo[] {
    return this.directions.map((direction) => ({
      direction,
      coordinate: this[direction](coord),
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
