import type { Board } from './Board';
import type { HexCoordinate } from './HexCoordinate';
import { directions, getOpposite, type Direction } from './Navigation';
import type { Terrain } from './Terrain';

/**
 * Board-level navigation helpers (neighbor queries, edge-facing terrains).
 * Static-only for now; may later hold a board reference for instance methods.
 */
export class BoardNavigation {
  /**
   * For each direction with a neighbor tile on the board, the terrain on that neighbor along the shared edge
   * (the edge that faces {@link coord}).
   */
  static neighborEdgeTerrains(
    board: Board,
    coord: HexCoordinate
  ): Partial<Record<Direction, Terrain>> {
    const returnValue: Partial<Record<Direction, Terrain>> = {};
    const existing = board.getExistingNeighborsAt(coord);
    for (const direction of directions) {
      const boardTile = existing[direction];
      if (boardTile) {
        returnValue[direction] = boardTile.tile.getTerrain(getOpposite(direction));
      }
    }
    return returnValue;
  }
}
