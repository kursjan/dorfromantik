import { Board } from './Board';
import { HexCoordinate } from './HexCoordinate';
import { Tile } from './Tile';

/**
 * GameHints encapsulates memoized computations based on the current game state.
 * It provides performance-optimized hints (like valid placement coordinates)
 * that would otherwise be expensive to compute on the fly (e.g., during 60FPS render loops).
 */
export class GameHints {
  private board: Board;
  public currentTile: Tile;

  // Caches
  private _validPlacements: HexCoordinate[] | null = null;

  constructor(board: Board, currentTile: Tile) {
    this.board = board;
    this.currentTile = currentTile;
  }

  /**
   * Returns a cached array of all valid empty coordinates adjacent to existing tiles.
   * If the cache is empty, it computes the coordinates using the board.
   */
  get validPlacements(): HexCoordinate[] {
    if (this._validPlacements === null) {
      this._validPlacements = this.board.getValidPlacementCoordinates();
    }
    return this._validPlacements;
  }

  /**
   * Invalidates the caches.
   * This MUST be called whenever the game state (board or current queued tile) changes.
   */
  invalidate() {
    this._validPlacements = null;
  }

  /**
   * Updates the internal references and invalidates caches.
   */
  updateState(board: Board, currentTile: Tile) {
    this.board = board;
    this.currentTile = currentTile;
    this.invalidate();
  }
}
