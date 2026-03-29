import { describe, it, expect, beforeEach } from 'vitest';
import { GameScorer } from './GameScorer';
import { Board } from './Board';
import { GameRules } from './GameRules';
import { Tile } from './Tile';
import { HexCoordinate } from './HexCoordinate';
import { north, northEast, getNeighbors, getOpposite, type Direction } from './Navigation';
import { toTerrain, type Terrain, type TerrainType } from './Terrain';

/**
 * Neighbor hex tile: `toTerrain('pasture')` on every side except `inwardEdgeDirection`, where
 * `inwardEdgeTerrain` faces the tile being placed next to (the shared edge).
 */
function neighborTileFacingInward(
  id: string,
  inwardEdgeDirection: Direction,
  inwardEdgeTerrain: Terrain
): Tile {
  const pastureSide = () => toTerrain('pasture');
  return new Tile({
    id,
    north: inwardEdgeDirection === 'north' ? inwardEdgeTerrain : pastureSide(),
    northEast: inwardEdgeDirection === 'northEast' ? inwardEdgeTerrain : pastureSide(),
    southEast: inwardEdgeDirection === 'southEast' ? inwardEdgeTerrain : pastureSide(),
    south: inwardEdgeDirection === 'south' ? inwardEdgeTerrain : pastureSide(),
    southWest: inwardEdgeDirection === 'southWest' ? inwardEdgeTerrain : pastureSide(),
    northWest: inwardEdgeDirection === 'northWest' ? inwardEdgeTerrain : pastureSide(),
  });
}

/**
 * 1. Lone Tile: 0 points.
 * 2. Single Neighbor (No Match): 0 points.
 * 3. Single Neighbor (Match): 10 points.
 * 4. Double Match: 20 points.
 * 5. Perfect Ring (Matching): 60 (match) + 60 (bonus) = 120 points.
 * 6. Perfect Ring (Mismatch): 5 matches, 1 mismatch = 50 points.
 * 7. Cascading Perfect: 10 (match) + 60 (neighbor becomes perfect) = 70 points.
 * 8. Double Cascading Perfect: 2 neighbors become perfect = 120 bonus points.
 */

describe('GameScorer', () => {
  let board: Board;
  let rules: GameRules;
  let scorer: GameScorer;
  let center: HexCoordinate;

  beforeEach(() => {
    board = new Board();
    rules = new GameRules({ initialTurns: 10 });
    scorer = new GameScorer(rules);
    center = new HexCoordinate(0, 0, 0);
  });

  /** Uniform tile: same terrain kind on all six sides (each side is its own instance). */
  const createTile = (id: string, terrain: TerrainType = 'pasture'): Tile =>
    new Tile({
      id,
      north: toTerrain(terrain),
      northEast: toTerrain(terrain),
      southEast: toTerrain(terrain),
      south: toTerrain(terrain),
      southWest: toTerrain(terrain),
      northWest: toTerrain(terrain),
    });

  /**
   * Surround `target` with neighbors whose inward edge is pasture, skipping `center` and occupied coords.
   */
  const surroundExceptCenter = (target: HexCoordinate, idPrefix: string) => {
    getNeighbors(target).forEach(({ direction, coordinate }) => {
      if (coordinate.equals(center)) return;
      if (board.has(coordinate)) return;

      const inwardEdgeDirection = getOpposite(direction);
      const inwardEdgeTerrain = toTerrain('pasture');
      const { board: newBoard } = board.place(
        neighborTileFacingInward(
          `${idPrefix}-${direction}`,
          inwardEdgeDirection,
          inwardEdgeTerrain
        ),
        coordinate
      );
      board = newBoard;
    });
  };

  it('should score 0 for a lone tile', () => {
    const tile = createTile('t1');
    const { board: newBoard, placedTile } = board.place(tile, center);
    board = newBoard;

    const result = scorer.scorePlacement(board, placedTile);
    expect(result.scoreAdded).toBe(0);
    expect(result.perfectCount).toBe(0);
  });

  it('should score 0 for a single neighbor with no match', () => {
    const northCoord = north(center);

    const centerTile = createTile('center', 'pasture');
    const { board: b1 } = board.place(centerTile, center);
    board = b1;

    const northTile = new Tile({
      id: 'north',
      north: toTerrain('pasture'),
      northEast: toTerrain('pasture'),
      southEast: toTerrain('pasture'),
      south: toTerrain('tree'),
      southWest: toTerrain('pasture'),
      northWest: toTerrain('pasture'),
    });
    const { board: b2, placedTile } = board.place(northTile, northCoord);
    board = b2;

    const result = scorer.scorePlacement(board, placedTile);
    expect(result.scoreAdded).toBe(0);
  });

  it('should score 10 when waterOrPasture matches water across the edge', () => {
    const northCoord = north(center);

    const northTile = new Tile({
      id: 'north',
      north: toTerrain('pasture'),
      northEast: toTerrain('pasture'),
      southEast: toTerrain('pasture'),
      south: toTerrain('water'),
      southWest: toTerrain('pasture'),
      northWest: toTerrain('pasture'),
    });
    const { board: b1 } = board.place(northTile, northCoord);
    board = b1;

    const centerTile = new Tile({
      id: 'center',
      north: toTerrain('waterOrPasture'),
      northEast: toTerrain('pasture'),
      southEast: toTerrain('pasture'),
      south: toTerrain('pasture'),
      southWest: toTerrain('pasture'),
      northWest: toTerrain('pasture'),
    });
    const { board: b2, placedTile } = board.place(centerTile, center);
    board = b2;

    const result = scorer.scorePlacement(board, placedTile);
    expect(result.scoreAdded).toBe(10);
  });

  it('should score 10 for a single neighbor with match', () => {
    const northCoord = north(center);

    const centerTile = createTile('center', 'pasture');
    const { board: b1 } = board.place(centerTile, center);
    board = b1;

    const { board: b2, placedTile } = board.place(createTile('north', 'pasture'), northCoord);
    board = b2;

    const result = scorer.scorePlacement(board, placedTile);
    expect(result.scoreAdded).toBe(10);
  });

  it('should score 20 for two matching neighbors', () => {
    const northCoord = north(center);
    const northEastCoord = northEast(center);

    const { board: b1 } = board.place(createTile('north', 'pasture'), northCoord);
    const { board: b2 } = b1.place(createTile('ne', 'pasture'), northEastCoord);
    board = b2;

    const { board: b3, placedTile } = board.place(createTile('center', 'pasture'), center);
    board = b3;

    const result = scorer.scorePlacement(board, placedTile);
    expect(result.scoreAdded).toBe(20);
  });

  it('should score 120 (60 match + 60 perfect) for a perfect ring placement', () => {
    getNeighbors(center).forEach(({ direction, coordinate }) => {
      const inwardEdgeDirection = getOpposite(direction);
      const inwardEdgeTerrain = toTerrain('pasture');
      const { board: newBoard } = board.place(
        neighborTileFacingInward(`n-${direction}`, inwardEdgeDirection, inwardEdgeTerrain),
        coordinate
      );
      board = newBoard;
    });

    const centerTile = createTile('center', 'pasture');
    const { board: bFinal, placedTile } = board.place(centerTile, center);
    board = bFinal;

    const result = scorer.scorePlacement(board, placedTile);
    expect(result.scoreAdded).toBe(120);
    expect(result.perfectCount).toBe(1);
  });

  it('should score 50 for a full ring with one mismatch', () => {
    const neighbors = getNeighbors(center);
    neighbors.forEach(({ direction, coordinate }, index) => {
      const inwardEdgeDirection = getOpposite(direction);
      const inwardEdgeTerrain = toTerrain(index < 5 ? 'pasture' : 'tree');
      const { board: newBoard } = board.place(
        neighborTileFacingInward(`n-${direction}`, inwardEdgeDirection, inwardEdgeTerrain),
        coordinate
      );
      board = newBoard;
    });

    const centerTile = createTile('center', 'pasture');
    const { board: bFinal, placedTile } = board.place(centerTile, center);
    board = bFinal;

    const result = scorer.scorePlacement(board, placedTile);
    expect(result.scoreAdded).toBe(50);
    expect(result.perfectCount).toBe(0);
  });

  it('should score 70 (10 match + 60 perfect) when a neighbor becomes perfect', () => {
    const northCoord = north(center);

    const centerTile = createTile('center', 'pasture');
    const { board: b1 } = board.place(centerTile, center);
    board = b1;

    getNeighbors(center).forEach(({ direction, coordinate }) => {
      if (direction === 'north') return;
      const inwardEdgeDirection = getOpposite(direction);
      const inwardEdgeTerrain = toTerrain('pasture');
      const { board: newBoard } = board.place(
        neighborTileFacingInward(`n-${direction}`, inwardEdgeDirection, inwardEdgeTerrain),
        coordinate
      );
      board = newBoard;
    });

    const northTile = new Tile({
      id: 'north',
      north: toTerrain('pasture'),
      northEast: toTerrain('pasture'),
      southEast: toTerrain('tree'),
      south: toTerrain('pasture'),
      southWest: toTerrain('tree'),
      northWest: toTerrain('pasture'),
    });
    const { board: bFinal, placedTile } = board.place(northTile, northCoord);
    board = bFinal;

    const result = scorer.scorePlacement(board, placedTile);
    expect(result.scoreAdded).toBe(70);
    expect(result.perfectCount).toBe(1);
  });

  it('should score multiple perfect bonuses if one placement completes multiple neighbors', () => {
    const northCoord = north(center);
    const northEastCoord = northEast(center);

    const { board: b1 } = board.place(createTile('north', 'pasture'), northCoord);
    const { board: b2 } = b1.place(createTile('northEast', 'pasture'), northEastCoord);
    board = b2;

    surroundExceptCenter(northCoord, 'n');
    surroundExceptCenter(northEastCoord, 'ne');

    const centerTile = createTile('center', 'pasture');
    const { board: bFinal, placedTile } = board.place(centerTile, center);
    board = bFinal;

    const result = scorer.scorePlacement(board, placedTile);
    expect(result.perfectCount).toBe(2);
    expect(result.scoreAdded).toBeGreaterThanOrEqual(140);
  });

  describe('isPerfect', () => {
    it('should return false for a lone tile', () => {
      const { board: newBoard, placedTile } = board.place(createTile('t1'), center);
      expect(scorer.isPerfect(newBoard, placedTile)).toBe(false);
    });

    it('should return false if tile has fewer than 6 neighbors', () => {
      const { board: b1, placedTile } = board.place(createTile('center'), center);
      board = b1;
      getNeighbors(center)
        .slice(0, 3)
        .forEach(({ coordinate }, i) => {
          const { board: nb } = board.place(createTile(`n${i}`), coordinate);
          board = nb;
        });

      expect(scorer.isPerfect(board, placedTile)).toBe(false);
    });

    it('should return false if 6 neighbors exist but one terrain mismatches', () => {
      const { board: b1, placedTile } = board.place(createTile('center', 'pasture'), center);
      board = b1;

      getNeighbors(center).forEach(({ direction, coordinate }, i) => {
        const inwardEdgeDirection = getOpposite(direction);
        const inwardEdgeTerrain = i === 5 ? toTerrain('tree') : toTerrain('pasture');
        const { board: nb } = board.place(
          neighborTileFacingInward(`n${i}`, inwardEdgeDirection, inwardEdgeTerrain),
          coordinate
        );
        board = nb;
      });

      expect(scorer.isPerfect(board, placedTile)).toBe(false);
    });

    it('should return true if 6 neighbors exist and all terrains match', () => {
      const { board: b1, placedTile } = board.place(createTile('center', 'pasture'), center);
      board = b1;

      getNeighbors(center).forEach(({ direction, coordinate }, i) => {
        const inwardEdgeDirection = getOpposite(direction);
        const inwardEdgeTerrain = toTerrain('pasture');
        const { board: nb } = board.place(
          neighborTileFacingInward(`n${i}`, inwardEdgeDirection, inwardEdgeTerrain),
          coordinate
        );
        board = nb;
      });

      expect(scorer.isPerfect(board, placedTile)).toBe(true);
    });
  });
});
