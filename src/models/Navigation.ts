import { HexCoordinate } from './HexCoordinate';

/**
 * Enum-like names for hex edge directions. Prefer `Direction.North` over raw `'north'` at call sites.
 * @see directions — canonical order for wedge indices / iteration
 */
export const Direction = {
  North: 'north',
  NorthEast: 'northEast',
  SouthEast: 'southEast',
  South: 'south',
  SouthWest: 'southWest',
  NorthWest: 'northWest',
} as const;

export type Direction = (typeof Direction)[keyof typeof Direction];

export interface NeighborInfo {
  direction: Direction;
  coordinate: HexCoordinate;
}

export const directions: Direction[] = [
  Direction.North,
  Direction.NorthEast,
  Direction.SouthEast,
  Direction.South,
  Direction.SouthWest,
  Direction.NorthWest,
];

export function getOpposite(direction: Direction): Direction {
  switch (direction) {
    case Direction.North:
      return Direction.South;
    case Direction.NorthEast:
      return Direction.SouthWest;
    case Direction.SouthEast:
      return Direction.NorthWest;
    case Direction.South:
      return Direction.North;
    case Direction.SouthWest:
      return Direction.NorthEast;
    case Direction.NorthWest:
      return Direction.SouthEast;
  }
}

export function getNeighbor(coord: HexCoordinate, direction: Direction): HexCoordinate {
  switch (direction) {
    case Direction.North:
      return north(coord);
    case Direction.NorthEast:
      return northEast(coord);
    case Direction.SouthEast:
      return southEast(coord);
    case Direction.South:
      return south(coord);
    case Direction.SouthWest:
      return southWest(coord);
    case Direction.NorthWest:
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
