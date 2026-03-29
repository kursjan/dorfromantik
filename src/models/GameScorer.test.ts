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
 *
 * COORDINATE SYSTEM (Flat-Top)
 *
 *          [North]     [NorthEast]
 *         (-1,0,1)      (-1,1,0)
 *            / \          / \
 * [NorthWest]   \        /   [SouthEast]
 *  (0,-1,1) ---- [Center] ---- (0,1,-1)
 *            /   (0,0,0)  \
 *           / \          / \
 *      [SouthWest]     [South]
 *       (1,-1,0)       (1,0,-1)
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
      if (coordinate.getKey() === center.getKey()) return;
      if (board.has(coordinate)) return;

      const inwardEdgeDirection = getOpposite(direction);
      const inwardEdgeTerrain = toTerrain('pasture');
      board.place(
        neighborTileFacingInward(
          `${idPrefix}-${direction}`,
          inwardEdgeDirection,
          inwardEdgeTerrain
        ),
        coordinate
      );
    });
  };

  it('should score 0 for a lone tile', () => {
    // Scenario 1. Lone Tile: 0 points.
    const tile = createTile('t1');
    const placed = board.place(tile, center);

    const result = scorer.scorePlacement(board, placed);
    expect(result.scoreAdded).toBe(0);
    expect(result.perfectCount).toBe(0);
  });

  it('should score 0 for a single neighbor with no match', () => {
    // Scenario 2. Single Neighbor (No Match): 0 points.
    const northCoord = north(center);

    // Center: all pasture; north edge faces the neighbor
    const centerTile = createTile('center', 'pasture');
    board.place(centerTile, center);

    // Neighbor: all pasture except south = tree (the edge shared with center)
    const northTile = new Tile({
      id: 'north',
      north: toTerrain('pasture'),
      northEast: toTerrain('pasture'),
      southEast: toTerrain('pasture'),
      south: toTerrain('tree'),
      southWest: toTerrain('pasture'),
      northWest: toTerrain('pasture'),
    });
    const placed = board.place(northTile, northCoord);

    const result = scorer.scorePlacement(board, placed);
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
    board.place(northTile, northCoord);

    const centerTile = new Tile({
      id: 'center',
      north: toTerrain('waterOrPasture'),
      northEast: toTerrain('pasture'),
      southEast: toTerrain('pasture'),
      south: toTerrain('pasture'),
      southWest: toTerrain('pasture'),
      northWest: toTerrain('pasture'),
    });
    const placed = board.place(centerTile, center);

    const result = scorer.scorePlacement(board, placed);
    expect(result.scoreAdded).toBe(10);
  });

  it('should score 10 for a single neighbor with match', () => {
    // Scenario 3. Single Neighbor (Match): 10 points.
    const northCoord = north(center);

    const centerTile = createTile('center', 'pasture');
    board.place(centerTile, center);

    const placed = board.place(createTile('north', 'pasture'), northCoord);

    const result = scorer.scorePlacement(board, placed);
    expect(result.scoreAdded).toBe(10);
  });

  it('should score 20 for two matching neighbors', () => {
    // Scenario 4. Double Match: 20 points.
    // Neighbors at North and NorthEast
    const northCoord = north(center);
    const northEastCoord = northEast(center);

    board.place(createTile('north', 'pasture'), northCoord);
    board.place(createTile('ne', 'pasture'), northEastCoord);

    const placed = board.place(createTile('center', 'pasture'), center);

    const result = scorer.scorePlacement(board, placed);
    expect(result.scoreAdded).toBe(20);
  });

  it('should score 120 (60 match + 60 perfect) for a perfect ring placement', () => {
    // Scenario 5. Perfect Ring (Matching): 60 (match) + 60 (bonus) = 120 points.

    // Surround with 6 matching neighbors
    getNeighbors(center).forEach(({ direction, coordinate }) => {
      const inwardEdgeDirection = getOpposite(direction);
      const inwardEdgeTerrain = toTerrain('pasture');
      board.place(
        neighborTileFacingInward(`n-${direction}`, inwardEdgeDirection, inwardEdgeTerrain),
        coordinate
      );
    });

    const centerTile = createTile('center', 'pasture');
    const placed = board.place(centerTile, center);

    const result = scorer.scorePlacement(board, placed);
    expect(result.scoreAdded).toBe(120);
    expect(result.perfectCount).toBe(1);
  });

  it('should score 50 for a full ring with one mismatch', () => {
    // Scenario 6. Perfect Ring (Mismatch): 5 matches, 1 mismatch = 50 points.

    const neighbors = getNeighbors(center);
    neighbors.forEach(({ direction, coordinate }, index) => {
      const inwardEdgeDirection = getOpposite(direction);
      const inwardEdgeTerrain = toTerrain(index < 5 ? 'pasture' : 'tree');
      board.place(
        neighborTileFacingInward(`n-${direction}`, inwardEdgeDirection, inwardEdgeTerrain),
        coordinate
      );
    });

    const centerTile = createTile('center', 'pasture');
    const placed = board.place(centerTile, center);

    const result = scorer.scorePlacement(board, placed);
    // 5 matches * 10 = 50. No perfect bonus.
    expect(result.scoreAdded).toBe(50);
    expect(result.perfectCount).toBe(0);
  });

  it('should score 70 (10 match + 60 perfect) when a neighbor becomes perfect', () => {
    // Scenario 7. Cascading Perfect: 10 (match) + 60 (neighbor becomes perfect) = 70 points.
    const northCoord = north(center);

    // 1. Setup Center to be missing only North neighbor to be perfect
    const centerTile = createTile('center', 'pasture');
    board.place(centerTile, center);

    // Place 5 neighbors (excluding North) matching Center
    getNeighbors(center).forEach(({ direction, coordinate }) => {
      if (direction === 'north') return; // Skip North

      const inwardEdgeDirection = getOpposite(direction);
      const inwardEdgeTerrain = toTerrain('pasture');
      board.place(
        neighborTileFacingInward(`n-${direction}`, inwardEdgeDirection, inwardEdgeTerrain),
        coordinate
      );
    });

    // 2. Place North neighbor.
    // It MUST match Center (South side).
    // It MUST NOT match its other neighbors (NE and NW) to avoid extra points.
    // North touches NE at SouthEast.
    // North touches NW at SouthWest.
    const northTile = new Tile({
      id: 'north',
      north: toTerrain('pasture'),
      northEast: toTerrain('pasture'),
      southEast: toTerrain('tree'), // mismatch NE (all pasture)
      south: toTerrain('pasture'), // match center
      southWest: toTerrain('tree'), // mismatch NW (all pasture)
      northWest: toTerrain('pasture'),
    });
    const placed = board.place(northTile, northCoord);

    const result = scorer.scorePlacement(board, placed);

    // Points:
    // - Match between North and Center: 10
    // - Center becomes perfect: 60
    // Total: 70
    expect(result.scoreAdded).toBe(70);
    expect(result.perfectCount).toBe(1);
  });

  it('should score multiple perfect bonuses if one placement completes multiple neighbors', () => {
    // Scenario 8. Double Cascading Perfect: 2 neighbors become perfect = 120 bonus points.
    const northCoord = north(center);
    const northEastCoord = northEast(center);

    // 1. Setup North and NorthEast as candidates
    board.place(createTile('north', 'pasture'), northCoord);
    board.place(createTile('northEast', 'pasture'), northEastCoord);

    surroundExceptCenter(northCoord, 'n');
    surroundExceptCenter(northEastCoord, 'ne');

    // 2. Place Center matching both
    const centerTile = createTile('center', 'pasture');
    const placed = board.place(centerTile, center);

    const result = scorer.scorePlacement(board, placed);

    // Points:
    // - Matches: Center touches N, NE, and potentially others from surround (NW and SE).
    // - Perfects: North and NorthEast both become perfect.
    expect(result.perfectCount).toBe(2);
    expect(result.scoreAdded).toBeGreaterThanOrEqual(140); // 20 (N, NE) + 120 (bonuses)
  });

  describe('isPerfect', () => {
    it('should return false for a lone tile', () => {
      const tile = board.place(createTile('t1'), center);
      expect(scorer.isPerfect(board, tile)).toBe(false);
    });

    it('should return false if tile has fewer than 6 neighbors', () => {
      const tile = board.place(createTile('center'), center);
      // Place only 3 neighbors
      getNeighbors(center)
        .slice(0, 3)
        .forEach(({ coordinate }, i) => {
          board.place(createTile(`n${i}`), coordinate);
        });

      expect(scorer.isPerfect(board, tile)).toBe(false);
    });

    it('should return false if 6 neighbors exist but one terrain mismatches', () => {
      const tile = board.place(createTile('center', 'pasture'), center);

      getNeighbors(center).forEach(({ direction, coordinate }, i) => {
        const inwardEdgeDirection = getOpposite(direction);
        const inwardEdgeTerrain = i === 5 ? toTerrain('tree') : toTerrain('pasture');
        board.place(
          neighborTileFacingInward(`n${i}`, inwardEdgeDirection, inwardEdgeTerrain),
          coordinate
        );
      });

      expect(scorer.isPerfect(board, tile)).toBe(false);
    });

    it('should return true if 6 neighbors exist and all terrains match', () => {
      const tile = board.place(createTile('center', 'pasture'), center);

      getNeighbors(center).forEach(({ direction, coordinate }, i) => {
        const inwardEdgeDirection = getOpposite(direction);
        const inwardEdgeTerrain = toTerrain('pasture');
        board.place(
          neighborTileFacingInward(`n${i}`, inwardEdgeDirection, inwardEdgeTerrain),
          coordinate
        );
      });

      expect(scorer.isPerfect(board, tile)).toBe(true);
    });
  });
});
