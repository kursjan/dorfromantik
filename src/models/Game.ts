import { Board } from './Board';
import { GameRules } from './GameRules';
import { Tile } from './Tile';
import { HexCoordinate } from './HexCoordinate';
import { getNeighbors } from './Navigation';
import { GameScorer } from './GameScorer';

export interface GameProps {
  board: Board;
  rules: GameRules;
  score?: number;
}

export interface PlacementResult {
  scoreAdded: number;
  perfectCount: number;
}

/**
 * Represents the state of an active game session.
 */
export class Game {
  /**
   * Factory method to create a new game with the board initialized with a starting tile.
   * @param rules - The rules to use for the game.
   * @returns A fully initialized Game instance.
   */
  static create(rules: GameRules): Game {
    const board = new Board();

    // 1. Create and place initial tile at origin (0, 0, 0)
    const startTile = rules.createInitialTile('start-tile');
    board.place(startTile, new HexCoordinate(0, 0, 0));

    // 2. Create the game instance
    return new Game({
      board,
      rules,
    });
  }

  /**
   * Shorthand for creating a game with standard rules.
   */
  static createStandard(): Game {
    return this.create(GameRules.createStandard());
  }

  readonly board: Board;
  readonly rules: GameRules;
  score: number;
  tileQueue: Tile[];

  private scorer: GameScorer;

  /**
   * Creates a new instance of Game.
   * @param props - Properties to initialize the game state.
   */
  constructor(props: GameProps) {
    this.board = props.board;
    this.rules = props.rules;
    this.score = props.score ?? 0;
    this.scorer = new GameScorer(this.rules);
    
    // If no queue is provided, initialize with random tiles based on rules
    this.tileQueue = this.generateInitialQueue();

    if (this.score < 0) {
      throw new Error('score must be non-negative');
    }
  }

  /**
   * Single source of truth for turns: the number of tiles remaining.
   */
  get remainingTurns(): number {
    return this.tileQueue.length;
  }

  /**
   * Returns the next tile to be placed without removing it from the queue.
   */
  peek(): Tile | undefined {
    return this.tileQueue[0];
  }

  /**
   * Rotates the tile currently at the head of the queue clockwise.
   * @throws Error if the queue is empty.
   */
  rotateQueuedTileClockwise(): void {
    const tile = this.tileQueue[0];
    if (!tile) {
      throw new Error('No tiles remaining in the queue');
    }

    this.tileQueue[0] = tile.rotateClockwise();
  }

  /**
   * Rotates the tile currently at the head of the queue counter-clockwise.
   * @throws Error if the queue is empty.
   */
  rotateQueuedTileCounterClockwise(): void {
    const tile = this.tileQueue[0];
    if (!tile) {
      throw new Error('No tiles remaining in the queue');
    }

    this.tileQueue[0] = tile.rotateCounterClockwise();
  }

  /**
   * Checks if a tile can be placed at the given coordinate.
   * A placement is valid if the hex is empty and adjacent to at least one existing tile.
   */
  isValidPlacement(coord: HexCoordinate): boolean {
    // 1. Position must be empty
    if (this.board.has(coord)) {
      return false;
    }

    // 2. Position must be adjacent to an existing tile
    const neighbors = getNeighbors(coord);
    return neighbors.some((neighbor) => this.board.has(neighbor.coordinate));
  }

  /**
   * Places the next tile from the queue at the given coordinate.
   * Updates score and board state.
   * @returns Results of the placement (e.g., score added).
   */
  placeTile(coord: HexCoordinate): PlacementResult {
    const tile = this.tileQueue.shift();
    if (!tile) {
      throw new Error('No tiles remaining in the queue');
    }

    const placedTile = this.board.place(tile, coord);

    // Delegate scoring to GameScorer
    const { scoreAdded, perfectCount } = this.scorer.scorePlacement(this.board, placedTile);

    // Add extra tiles to the queue for perfect placements
    const extraTilesCount = perfectCount * this.rules.turnsPerPerfect;
    for (let i = 0; i < extraTilesCount; i++) {
      this.tileQueue.push(this.rules.tileGenerator.createTile(`bonus-${Date.now()}-${i}`));
    }

    this.score += scoreAdded;
    return { scoreAdded, perfectCount };
  }

  private generateInitialQueue(): Tile[] {
    const queue: Tile[] = [];
    for (let i = 0; i < this.rules.initialTurns; i++) {
      queue.push(this.rules.tileGenerator.createTile(`initial-${i}`));
    }
    return queue;
  }
}
