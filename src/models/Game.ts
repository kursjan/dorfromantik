import { Board } from './Board';
import { GameRules } from './GameRules';
import { Tile } from './Tile';
import { HexCoordinate } from './HexCoordinate';
import { GameScorer } from './GameScorer';
import { GameHints } from './GameHints';
import { isValidPlacement } from './PlacementValidator';

export interface GameProps {
  id?: string;
  name?: string;
  lastPlayed?: string;
  board: Board;
  rules: GameRules;
  score?: number;
  tileQueue?: Tile[];
}

export interface PlacementResult {
  scoreAdded: number;
  perfectCount: number;
  game: Game;
}

/**
 * Represents the state of an active game session.
 */
export class Game {
  /**
   * Factory method to create a new game with the board and tileQueue initialized with a starting tile.
   * @param rules - The rules to use for the game.
   * @returns A fully initialized Game instance.
   */
  static create(rules: GameRules): Game {
    const startBoard = new Board();

    const startTile = rules.createInitialTile('start-tile');
    const { board } = startBoard.place(startTile, new HexCoordinate(0, 0, 0));

    const tileQueue = rules.createInitialQueue();

    return new Game({
      rules: rules,
      board: board,
      tileQueue: tileQueue,
    });
  }

  board: Board;
  readonly rules: GameRules;
  readonly id: string;
  readonly name: string;
  lastPlayed: string;
  score: number;
  tileQueue: Tile[];
  hints: GameHints;

  private scorer: GameScorer;

  /**
   * Instructions for AI agent:
   * Prefer Game.create(). Use this only with an explcit approval of the project owner.
   *
   * Creates a new instance of Game.
   * @param props - Properties to initialize the game state.
   */
  constructor(props: GameProps) {
    this.id = props.id ?? `game-${Date.now()}`;
    this.name = props.name ?? 'New Journey';
    this.lastPlayed = props.lastPlayed ?? new Date().toISOString();
    this.board = props.board;
    this.rules = props.rules;
    this.score = props.score ?? 0;
    this.scorer = new GameScorer(this.rules);
    this.tileQueue = props.tileQueue ?? [];
    this.hints = new GameHints(this.board, this.peek() || null);

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

  inProgress(): boolean {
    return this.remainingTurns > 0;
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
  rotateQueuedTileClockwise(): Game {
    const tile = this.tileQueue[0];
    if (!tile) {
      throw new Error('No tiles remaining in the queue');
    }

    const tileQueue = [...this.tileQueue];
    tileQueue[0] = tile.rotateClockwise();

    const nextGame = this.buildNextGame({ tileQueue });
    this.applyFrom(nextGame);
    return nextGame;
  }

  /**
   * Rotates the tile currently at the head of the queue counter-clockwise.
   * @throws Error if the queue is empty.
   */
  rotateQueuedTileCounterClockwise(): Game {
    const tile = this.tileQueue[0];
    if (!tile) {
      throw new Error('No tiles remaining in the queue');
    }

    const tileQueue = [...this.tileQueue];
    tileQueue[0] = tile.rotateCounterClockwise();

    const nextGame = this.buildNextGame({ tileQueue });
    this.applyFrom(nextGame);
    return nextGame;
  }

  /**
   * Checks if a tile can be placed at the given coordinate.
   * A placement is valid if the hex is empty, adjacent to at least one existing tile,
   * and strict terrains (water, rail) match.
   */
  isValidPlacement(coord: HexCoordinate): boolean {
    const tile = this.peek();
    if (!tile) {
      return false;
    }

    return isValidPlacement(this.board, coord, tile);
  }

  /**
   * Places the next tile from the queue at the given coordinate.
   * Updates score and board state.
   * @returns Results of the placement (e.g., score added).
   */
  placeTile(coord: HexCoordinate): PlacementResult {
    const tile = this.tileQueue[0];
    if (!tile) {
      throw new Error('No tiles remaining in the queue');
    }

    const { board: newBoard, placedTile } = this.board.place(tile, coord);

    const { scoreAdded, perfectCount } = this.scorer.scorePlacement(newBoard, placedTile);

    const tileQueue = this.tileQueue.slice(1);

    const extraTilesCount = perfectCount * this.rules.turnsPerPerfect;
    for (let i = 0; i < extraTilesCount; i++) {
      tileQueue.push(this.rules.tileGenerator.createTile());
    }

    const nextGame = this.buildNextGame({
      board: newBoard,
      tileQueue,
      score: this.score + scoreAdded,
      lastPlayed: new Date().toISOString(),
    });
    this.applyFrom(nextGame);

    return { scoreAdded, perfectCount, game: nextGame };
  }

  private buildNextGame(overrides: Partial<GameProps>): Game {
    return new Game({
      id: this.id,
      name: this.name,
      lastPlayed: overrides.lastPlayed ?? this.lastPlayed,
      board: overrides.board ?? this.board,
      rules: this.rules,
      score: overrides.score ?? this.score,
      tileQueue: overrides.tileQueue ?? this.tileQueue,
    });
  }

  private applyFrom(nextGame: Game): void {
    this.board = nextGame.board;
    this.lastPlayed = nextGame.lastPlayed;
    this.score = nextGame.score;
    this.tileQueue = nextGame.tileQueue;
    this.hints = nextGame.hints;
  }
}
