import { Board, type BoardTile } from './Board';
import { GameRules } from './GameRules';
import { getOpposite, type Direction } from './Navigation';

export interface ScoringResult {
  scoreAdded: number;
  perfectCount: number;
}

/**
 * Handles scoring logic for the game, including point calculation
 * and perfect placement bonuses.
 */
export class GameScorer {
  private rules: GameRules;

  constructor(rules: GameRules) {
    this.rules = rules;
  }

  /**
   * Calculates the score for a tile placement.
   * Assumes the tile has already been placed on the board.
   *
   * @param board The game board with the placed tile.
   * @param placedTile The newly placed tile on the board.
   * @returns The scoring result including points added and perfect bonuses.
   */
  scorePlacement(board: Board, placedTile: BoardTile): ScoringResult {
    const { tile, coordinate } = placedTile;

    let scoreAdded = 0;
    let perfectCount = 0;

    // 1. Identify all neighbors
    const existingNeighbors = board.getExistingNeighbors(coordinate);

    // 2. Standard Scoring: matching terrain on adjacent tiles
    for (const [direction, neighbor] of Object.entries(existingNeighbors) as [
      Direction,
      BoardTile,
    ][]) {
      const myTerrain = tile.getTerrain(direction);
      const oppositeSide = getOpposite(direction);
      const neighborTerrain = neighbor.tile.getTerrain(oppositeSide);

      if (myTerrain === neighborTerrain) {
        scoreAdded += this.rules.pointsPerMatch;
      }
    }

    // 3. Perfect Bonuses: Check the newly placed tile
    if (this.isPerfect(board, placedTile)) {
      perfectCount++;
    }

    // 4. Perfect Bonuses: Check neighbors that might have become perfect
    perfectCount += Object.values(existingNeighbors)
      .filter((neighbor) => this.isPerfect(board, neighbor))
      .length;

    // 5. Apply Perfect Bonuses
    scoreAdded += perfectCount * this.rules.pointsPerPerfect;

    return { scoreAdded, perfectCount };
  }

  /**
   * Checks if a tile at the given coordinate is "Perfect".
   * A tile is perfect if it has 6 neighbors and all 6 edges match.
   */
  isPerfect(board: Board, boardTile: BoardTile): boolean {
    const existing = board.getExistingNeighbors(boardTile.coordinate);
    const directions = Object.keys(existing) as Direction[];

    // must have all six neighbors to be perfect
    if (directions.length !== 6) {
      return false;
    }

    for (const direction of directions) {
      const existingNeighbor = existing[direction]!;

      const myTerrain = boardTile.tile.getTerrain(direction);
      const oppositeSide = getOpposite(direction);
      const neighborTerrain = existingNeighbor.tile.getTerrain(oppositeSide);

      if (myTerrain !== neighborTerrain) {
        return false; // All must match
      }
    }

    return true;
  }
}
