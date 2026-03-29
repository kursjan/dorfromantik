import { Board } from './Board';
import { HexCoordinate } from './HexCoordinate';
import { Tile } from './Tile';
import { Terrain } from './Terrain';
import { getOpposite, type Direction } from './Navigation';

/**
 * Returns true if a tile can be placed at the given coordinate.
 * A placement is valid if the coordinate is empty, adjacent to at least one existing tile,
 * and strict terrains (water, rail) match adjacent terrains.
 */
export function isValidPlacement(board: Board, coordinate: HexCoordinate, tile: Tile): boolean {
  return (
    isPositionEmpty(board, coordinate) &&
    hasAdjacentTile(board, coordinate) &&
    doStrictEdgesMatch(board, coordinate, tile)
  );
}

/**
 * @visibleForTesting
 */
export function isStrict(terrain: Terrain): boolean {
  return terrain.id === 'water' || terrain.id === 'rail' || terrain.id === 'waterOrPasture';
}

/**
 * @visibleForTesting
 */
export function isPositionEmpty(board: Board, coordinate: HexCoordinate): boolean {
  return !board.has(coordinate);
}

/**
 * @visibleForTesting
 */
export function hasAdjacentTile(board: Board, coordinate: HexCoordinate): boolean {
  const existingNeighbors = board.getExistingNeighborsAt(coordinate);
  return Object.keys(existingNeighbors).length > 0;
}

/**
 * @visibleForTesting
 */
export function doStrictEdgesMatch(board: Board, coordinate: HexCoordinate, tile: Tile): boolean {
  const existingNeighbors = board.getExistingNeighborsAt(coordinate);

  for (const [dir, neighborTile] of Object.entries(existingNeighbors)) {
    const direction = dir as Direction;
    const myEdge = tile.getTerrain(direction);
    const neighborEdge = neighborTile.tile.getTerrain(getOpposite(direction));

    if (isStrict(myEdge) || isStrict(neighborEdge)) {
      if (!myEdge.matchesForEdge(neighborEdge)) {
        return false;
      }
    }
  }

  return true;
}
