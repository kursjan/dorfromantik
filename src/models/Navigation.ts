import { HexCoordinate } from './HexCoordinate';

export type Direction = 'north' | 'northEast' | 'southEast' | 'south' | 'southWest' | 'northWest';

export interface NeighborInfo {
  direction: Direction;
  coordinate: HexCoordinate;
}

export const directions: Direction[] = ['north', 'northEast', 'southEast', 'south', 'southWest', 'northWest'];

export function getOpposite(direction: Direction): Direction {
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

export function getNeighbor(coord: HexCoordinate, direction: Direction): HexCoordinate {
  switch (direction) {
    case 'north':
      return north(coord);
    case 'northEast':
      return northEast(coord);
    case 'southEast':
      return southEast(coord);
    case 'south':
      return south(coord);
    case 'southWest':
      return southWest(coord);
    case 'northWest':
      return northWest(coord);
  }
}

export function getNeighbors(coord: HexCoordinate): NeighborInfo[] {
  return directions.map((direction) => ({
    direction,
    coordinate: getNeighbor(coord, direction),
  }));
}

export function north(coord: HexCoordinate): HexCoordinate {
  return new HexCoordinate(coord.q - 1, coord.r, coord.s + 1);
}

export function northEast(coord: HexCoordinate): HexCoordinate {
  return new HexCoordinate(coord.q - 1, coord.r + 1, coord.s);
}

export function southEast(coord: HexCoordinate): HexCoordinate {
  return new HexCoordinate(coord.q, coord.r + 1, coord.s - 1);
}

export function south(coord: HexCoordinate): HexCoordinate {
  return new HexCoordinate(coord.q + 1, coord.r, coord.s - 1);
}

export function southWest(coord: HexCoordinate): HexCoordinate {
  return new HexCoordinate(coord.q + 1, coord.r - 1, coord.s);
}

export function northWest(coord: HexCoordinate): HexCoordinate {
  return new HexCoordinate(coord.q, coord.r - 1, coord.s + 1);
}
