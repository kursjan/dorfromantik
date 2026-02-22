import { Board } from './Board';
import { GameRules } from './GameRules';
import { Tile } from './Tile';
import { HexCoordinate } from './HexCoordinate';
import { Navigation } from './Navigation';

export interface GameProps {
  board: Board;
  rules: GameRules;
  score?: number;
  tileQueue?: Tile[];
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

  private navigation = new Navigation();

  /**
   * Creates a new instance of Game.
   * @param props - Properties to initialize the game state.
   */
  constructor(props: GameProps) {
    this.board = props.board;
    this.rules = props.rules;
    this.score = props.score ?? 0;
    
    // If no queue is provided, initialize with random tiles based on rules
    this.tileQueue = props.tileQueue ?? this.generateInitialQueue(props.rules.initialTurns);

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
    const neighbors = this.navigation.getNeighbors(coord);
    return neighbors.some((neighbor) => this.board.has(neighbor.coordinate));
  }

  /**
   * Checks if a tile at the given coordinate is "Perfect".
   * A tile is perfect if it has 6 neighbors and all 6 edges match.
   */
  isPerfect(coord: HexCoordinate): boolean {
    const boardTile = this.board.get(coord);
    if (!boardTile) {
      return false;
    }

    const neighbors = this.navigation.getNeighbors(coord);
    if (neighbors.length !== 6) {
      throw new Error(`Expected 6 neighbors, but found ${neighbors.length}`);
    }

    for (const { direction, coordinate } of neighbors) {
      const neighbor = this.board.get(coordinate);
      if (!neighbor) {
        return false; // Must have all 6 neighbors
      }

      const myTerrain = boardTile.tile.getTerrain(direction);
      const oppositeSide = this.navigation.getOpposite(direction);
      const neighborTerrain = neighbor.tile.getTerrain(oppositeSide);

      if (myTerrain !== neighborTerrain) {
        return false; // All must match
      }
    }

    return true;
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

    // 1. Identify neighbors that exist before placing the tile.
    // They are all candidates to become perfect because this placement
    // might be their 6th neighbor.
    const neighbors = this.navigation.getNeighbors(coord);
    const existingNeighborCoords = this.board
      .getNeighbors(coord, this.navigation)
      .map((n) => n.coordinate);

    this.board.place(tile, coord);

    let scoreAdded = 0;
    let perfectCount = 0;

    // 2. Standard Scoring: matching terrain on adjacent tiles
    for (const { direction, coordinate } of neighbors) {
      const neighbor = this.board.get(coordinate);

      if (neighbor) {
        const myTerrain = tile.getTerrain(direction);
        const oppositeSide = this.navigation.getOpposite(direction);
        const neighborTerrain = neighbor.tile.getTerrain(oppositeSide);

        if (myTerrain === neighborTerrain) {
          scoreAdded += this.rules.pointsPerMatch;
        }
      }
    }

    // 3. Perfect Bonuses: Check the newly placed tile
    if (this.isPerfect(coord)) {
      perfectCount++;
    }

    // 4. Perfect Bonuses: Check neighbors that JUST became perfect
    for (const neighborCoord of existingNeighborCoords) {
      if (this.isPerfect(neighborCoord)) {
        perfectCount++;
      }
    }

    // 5. Apply Perfect Bonuses
    scoreAdded += perfectCount * this.rules.pointsPerPerfect;

    // Add extra tiles to the queue
    const extraTilesCount = perfectCount * this.rules.turnsPerPerfect;
    for (let i = 0; i < extraTilesCount; i++) {
      this.tileQueue.push(Tile.createRandom(`bonus-${Date.now()}-${i}`));
    }

    this.score += scoreAdded;
    return { scoreAdded, perfectCount };
  }

  private generateInitialQueue(count: number): Tile[] {
    const queue: Tile[] = [];
    for (let i = 0; i < count; i++) {
      queue.push(Tile.createRandom(`init-${i}`));
    }
    return queue;
  }
}
