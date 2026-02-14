import { HexCoordinate } from './HexCoordinate';

export class Navigation {
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
