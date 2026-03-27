import { Board } from './Board';
import { HexCoordinate } from './HexCoordinate';

/**
 * Returns true if a tile can be placed at the given coordinate.
 * A placement is valid if the coordinate is empty and adjacent to at least one existing tile.
 */
export function isValidPlacement(board: Board, coordinate: HexCoordinate): boolean {
  // 1. Position must be empty
  if (board.has(coordinate)) {
    return false;
  }

  // 2. Position must be adjacent to at least one existing tile
  const existingNeighbors = board.getExistingNeighborsAt(coordinate);
  return Object.keys(existingNeighbors).length > 0;
}
