import { Board } from './Board';
import { HexCoordinate } from './HexCoordinate';
import { Tile } from './Tile';

/**
 * GameHints encapsulates pre-computed calculations based on the current game state.
 * It is an immutable data structure; a new instance is created whenever the game state changes.
 */
export class GameHints {
  public readonly board: Board;
  public readonly currentTile: Tile | null;
  public readonly validPlacements: readonly HexCoordinate[];

  constructor(board: Board, currentTile: Tile | null) {
    this.board = board;
    this.currentTile = currentTile;
    this.validPlacements = Object.freeze(this.computeValidPlacements());
  }

  private computeValidPlacements(): HexCoordinate[] {
    if (this.currentTile === null) {
      return [];
    }
    return this.board.getValidPlacementCoordinates(this.currentTile);
  }
}
