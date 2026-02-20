import { Board } from './Board';
import { GameRules } from './GameRules';
import { Tile } from './Tile';
import { HexCoordinate } from './HexCoordinate';
import { Navigation } from './Navigation';

export interface GameProps {
  board: Board;
  rules: GameRules;
  score?: number;
  remainingTurns?: number;
  tileQueue?: Tile[];
}

/**
 * Represents the state of an active game session.
 */
export class Game {
  readonly board: Board;
  readonly rules: GameRules;
  score: number;
  remainingTurns: number;
  tileQueue: Tile[];

  private navigation = new Navigation();

  /**
   * Creates a new instance of Game.
   * @param props - Properties to initialize the game state.
   */
  constructor(props: GameProps) {
    this.board = props.board;
    this.rules = props.rules;
    this.score = props.score ?? 0;
    this.remainingTurns = props.remainingTurns ?? props.rules.initialTurns;
    this.tileQueue = props.tileQueue ?? [];

    if (this.score < 0) {
      throw new Error('score must be non-negative');
    }
    if (this.remainingTurns < 0) {
      throw new Error('remainingTurns must be non-negative');
    }
  }

  /**
   * Places the next tile from the queue at the given coordinate.
   * Updates score, turns, and board state.
   */
  placeTile(coord: HexCoordinate): void {
    const tile = this.tileQueue.shift();
    if (!tile) {
      throw new Error('No tiles remaining in the queue');
    }

    this.board.place(tile, coord);
    this.remainingTurns -= 1;

    // Scoring: matching terrain on adjacent tiles
    this.navigation.getNeighbors(coord).forEach(({ direction, coordinate }) => {
      const neighbor = this.board.get(coordinate);

      if (neighbor) {
        const myTerrain = tile.getTerrain(direction);
        const oppositeSide = this.navigation.getOpposite(direction);
        const neighborTerrain = neighbor.tile.getTerrain(oppositeSide);

        if (myTerrain === neighborTerrain) {
          this.score += this.rules.pointsPerMatch;
        }
      }
    });
  }
}
