import { Board } from './Board';
import { GameRules } from './GameRules';
import { Tile } from './Tile';

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
  readonly score: number;
  readonly remainingTurns: number;
  readonly tileQueue: Tile[];

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
}
