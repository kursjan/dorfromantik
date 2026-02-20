import { Board } from './Board';
import { GameRules } from './GameRules';
import { Tile, TerrainType } from './Tile';
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
}

/**
 * Represents the state of an active game session.
 */
export class Game {
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
   * Places the next tile from the queue at the given coordinate.
   * Updates score and board state.
   * @returns Results of the placement (e.g., score added).
   */
  placeTile(coord: HexCoordinate): PlacementResult {
    const tile = this.tileQueue.shift();
    if (!tile) {
      throw new Error('No tiles remaining in the queue');
    }

    this.board.place(tile, coord);

    let scoreAdded = 0;

    // Scoring: matching terrain on adjacent tiles
    this.navigation.getNeighbors(coord).forEach(({ direction, coordinate }) => {
      const neighbor = this.board.get(coordinate);

      if (neighbor) {
        const myTerrain = tile.getTerrain(direction);
        const oppositeSide = this.navigation.getOpposite(direction);
        const neighborTerrain = neighbor.tile.getTerrain(oppositeSide);

        if (myTerrain === neighborTerrain) {
          scoreAdded += this.rules.pointsPerMatch;
        }
      }
    });

    this.score += scoreAdded;
    return { scoreAdded };
  }

  private generateInitialQueue(count: number): Tile[] {
    const queue: Tile[] = [];
    for (let i = 0; i < count; i++) {
      queue.push(this.createRandomTile(`init-${i}`));
    }
    return queue;
  }

  private createRandomTile(id: string): Tile {
    const terrains: TerrainType[] = ['tree', 'house', 'water', 'pasture', 'rail', 'field'];
    const getRandom = () => terrains[Math.floor(Math.random() * terrains.length)];

    return new Tile({
      id,
      north: getRandom(),
      northEast: getRandom(),
      southEast: getRandom(),
      south: getRandom(),
      southWest: getRandom(),
      northWest: getRandom(),
    });
  }
}
