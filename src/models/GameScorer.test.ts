import { describe, it, expect, beforeEach } from 'vitest';
import { GameScorer } from './GameScorer';
import { Board } from './Board';
import { GameRules } from './GameRules';
import { Tile, type TileOptions, type TerrainType } from './Tile';
import { HexCoordinate } from './HexCoordinate';
import { north, northEast, getNeighbors, getOpposite } from './Navigation';

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

  // Helper to create a tile with identical terrain on all sides
  const createTile = (id: string, terrain: TerrainType = 'pasture'): Tile => {
      return new Tile({
          id,
          north: terrain,
          northEast: terrain,
          southEast: terrain,
          south: terrain,
          southWest: terrain,
          northWest: terrain,
      });
  };

  // Helper to create a tile with specific sides
  const createSpecificTile = (id: string, props: Partial<TileOptions>): Tile => {
      const defaults: TileOptions = {
          id,
          north: 'pasture',
          northEast: 'pasture',
          southEast: 'pasture',
          south: 'pasture',
          southWest: 'pasture',
          northWest: 'pasture',
          ...props
      };
      return new Tile(defaults);
  };

  /**
   * Helper to surround a target coordinate with matching neighbors, 
   * specifically ignoring the 'center' coordinate to allow for later placement.
   */
  const surroundExceptCenter = (target: HexCoordinate, idPrefix: string) => {
    getNeighbors(target).forEach(({ direction, coordinate }) => {
        if (coordinate.getKey() === center.getKey()) return;
        if (board.has(coordinate)) return;

        const opposite = getOpposite(direction);
        const props: any = {};
        props[opposite] = 'pasture';
        board.place(createSpecificTile(`${idPrefix}-${direction}`, props), coordinate);
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

      // Center has plains at North
      const centerTile = createSpecificTile('center', { north: 'pasture' });
      board.place(centerTile, center);

      // Neighbor has forest at South (facing center)
      const northTile = createSpecificTile('north', { south: 'tree' });
      const placed = board.place(northTile, northCoord);

      const result = scorer.scorePlacement(board, placed);
      expect(result.scoreAdded).toBe(0);
  });

  it('should score 10 for a single neighbor with match', () => {
      // Scenario 3. Single Neighbor (Match): 10 points.
      const northCoord = north(center);

      // Center has plains at North
      const centerTile = createSpecificTile('center', { north: 'pasture' });
      board.place(centerTile, center);

      // Neighbor has plains at South
      const northTile = createSpecificTile('north', { south: 'pasture' });
      const placed = board.place(northTile, northCoord);

      const result = scorer.scorePlacement(board, placed);
      expect(result.scoreAdded).toBe(10);
  });

  it('should score 20 for two matching neighbors', () => {
      // Scenario 4. Double Match: 20 points.
      // Neighbors at North and NorthEast
      const northCoord = north(center);
      const northEastCoord = northEast(center);

      const northTile = createSpecificTile('north', { south: 'pasture' });
      const neTile = createSpecificTile('ne', { southWest: 'pasture' });
      
      board.place(northTile, northCoord);
      board.place(neTile, northEastCoord);

      // Place center matching both
      const centerTile = createSpecificTile('center', { north: 'pasture', northEast: 'pasture' });
      const placed = board.place(centerTile, center);

      const result = scorer.scorePlacement(board, placed);
      expect(result.scoreAdded).toBe(20);
  });

  it('should score 120 (60 match + 60 perfect) for a perfect ring placement', () => {
      // Scenario 5. Perfect Ring (Matching): 60 (match) + 60 (bonus) = 120 points.
      
      // Surround with 6 matching neighbors
      getNeighbors(center).forEach(({ direction, coordinate }) => {
          // Center will be all 'pasture', so neighbors must present 'pasture' on opposite side
          const opposite = getOpposite(direction);
          const props: any = {};
          props[opposite] = 'pasture';
          board.place(createSpecificTile(`n-${direction}`, props), coordinate);
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
          const opposite = getOpposite(direction);
          const props: any = {};
          // First 5 match (plains), last one mismatches (forest)
          props[opposite] = index < 5 ? 'pasture' : 'tree';
          board.place(createSpecificTile(`n-${direction}`, props), coordinate);
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
          
          const opposite = getOpposite(direction);
          const props: any = {};
          props[opposite] = 'pasture';
          board.place(createSpecificTile(`n-${direction}`, props), coordinate);
      });

      // 2. Place North neighbor.
      // It MUST match Center (South side).
      // It MUST NOT match its other neighbors (NE and NW) to avoid extra points.
      // North touches NE at SouthEast.
      // North touches NW at SouthWest.
      const northTile = createSpecificTile('north', { 
          south: 'pasture',      // Match Center
          southEast: 'tree',  // Mismatch NE (which is default plains)
          southWest: 'tree'   // Mismatch NW (which is default plains)
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
      getNeighbors(center).slice(0, 3).forEach(({ coordinate }, i) => {
        board.place(createTile(`n${i}`), coordinate);
      });
      
      expect(scorer.isPerfect(board, tile)).toBe(false);
    });

    it('should return false if 6 neighbors exist but one terrain mismatches', () => {
      const tile = board.place(createTile('center', 'pasture'), center);
      
      getNeighbors(center).forEach(({ direction, coordinate }, i) => {
        const opposite = getOpposite(direction);
        const terrain = i === 5 ? 'tree' : 'pasture'; // One mismatch
        board.place(createSpecificTile(`n${i}`, { [opposite]: terrain }), coordinate);
      });

      expect(scorer.isPerfect(board, tile)).toBe(false);
    });

    it('should return true if 6 neighbors exist and all terrains match', () => {
      const tile = board.place(createTile('center', 'pasture'), center);
      
      getNeighbors(center).forEach(({ direction, coordinate }, i) => {
        const opposite = getOpposite(direction);
        board.place(createSpecificTile(`n${i}`, { [opposite]: 'pasture' }), coordinate);
      });

      expect(scorer.isPerfect(board, tile)).toBe(true);
    });
  });
});
