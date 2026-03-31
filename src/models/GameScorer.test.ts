import { describe, it, expect } from 'vitest';
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
  const rules = new GameRules({ initialTurns: 10 });
  const scorer = new GameScorer(rules);
  const center = new HexCoordinate(0, 0, 0);
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
  const surroundExceptCenter = (
    sourceBoard: Board,
    target: HexCoordinate,
    idPrefix: string
  ): Board =>
    getNeighbors(target).reduce((acc, { direction, coordinate }) => {
      if (coordinate.equals(center)) return acc;
      if (acc.has(coordinate)) return acc;
      const inwardEdgeDirection = getOpposite(direction);
      const inwardEdgeTerrain = toTerrain('pasture');
      return acc.withTile(
        neighborTileFacingInward(
          `${idPrefix}-${direction}`,
          inwardEdgeDirection,
          inwardEdgeTerrain
        ),
        coordinate
      );
    }, sourceBoard);
  it('should score 0 for a lone tile', () => {
    const tile = createTile('t1');
    const { board: updatedBoard, placedTile } = new Board().place(tile, center);
    const result = scorer.scorePlacement(updatedBoard, placedTile);
    expect(result.scoreAdded).toBe(0);
    expect(result.perfectCount).toBe(0);
  });

  it('should score 0 for a single neighbor with no match', () => {
    // Arrange
    const northCoord = north(center);
    const centerTile = createTile('center', 'pasture');
    const boardWithCenter = Board.withTile(centerTile, center);
    const northTile = new Tile({
      id: 'north',
      north: toTerrain('pasture'),
      northEast: toTerrain('pasture'),
      southEast: toTerrain('pasture'),
      south: toTerrain('tree'),
      southWest: toTerrain('pasture'),
      northWest: toTerrain('pasture'),
    });

    // Act
    const { board: updatedBoard, placedTile } = boardWithCenter.place(northTile, northCoord);
    const result = scorer.scorePlacement(updatedBoard, placedTile);

    // Assert
    expect(result.scoreAdded).toBe(0);
  });

  it('should score 10 when waterOrPasture matches water across the edge', () => {
    // Arrange
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
    const boardWithNorth = Board.withTile(northTile, northCoord);
    const centerTile = new Tile({
      id: 'center',
      north: toTerrain('waterOrPasture'),
      northEast: toTerrain('pasture'),
      southEast: toTerrain('pasture'),
      south: toTerrain('pasture'),
      southWest: toTerrain('pasture'),
      northWest: toTerrain('pasture'),
    });

    // Act
    const { board: updatedBoard, placedTile } = boardWithNorth.place(centerTile, center);
    const result = scorer.scorePlacement(updatedBoard, placedTile);

    // Assert
    expect(result.scoreAdded).toBe(10);
  });

  it('should score 10 for a single neighbor with match', () => {
    // Arrange
    const northCoord = north(center);
    const centerTile = createTile('center', 'pasture');
    const boardWithCenter = Board.withTile(centerTile, center);

    // Act
    const { board: updatedBoard, placedTile } = boardWithCenter.place(
      createTile('north', 'pasture'),
      northCoord
    );
    const result = scorer.scorePlacement(updatedBoard, placedTile);

    // Assert
    expect(result.scoreAdded).toBe(10);
  });

  it('should score 20 for two matching neighbors', () => {
    // Arrange
    const northCoord = north(center);
    const northEastCoord = northEast(center);
    const boardWithNeighbors = new Board()
      .withTile(createTile('north', 'pasture'), northCoord)
      .withTile(createTile('ne', 'pasture'), northEastCoord);

    // Act
    const { board: updatedBoard, placedTile } = boardWithNeighbors.place(
      createTile('center', 'pasture'),
      center
    );
    const result = scorer.scorePlacement(updatedBoard, placedTile);

    // Assert
    expect(result.scoreAdded).toBe(20);
  });

  it('should score 120 (60 match + 60 perfect) for a perfect ring placement', () => {
    // Arrange
    const boardWithRing = getNeighbors(center).reduce((acc, { direction, coordinate }) => {
      const inwardEdgeDirection = getOpposite(direction);
      const inwardEdgeTerrain = toTerrain('pasture');
      return acc.withTile(
        neighborTileFacingInward(`n-${direction}`, inwardEdgeDirection, inwardEdgeTerrain),
        coordinate
      );
    }, new Board());
    const centerTile = createTile('center', 'pasture');

    // Act
    const { board: updatedBoard, placedTile } = boardWithRing.place(centerTile, center);
    const result = scorer.scorePlacement(updatedBoard, placedTile);

    // Assert
    expect(result.scoreAdded).toBe(120);
    expect(result.perfectCount).toBe(1);
  });

  it('should score 50 for a full ring with one mismatch', () => {
    // Arrange
    const boardWithRing = getNeighbors(center).reduce((acc, { direction, coordinate }, index) => {
      const inwardEdgeDirection = getOpposite(direction);
      const inwardEdgeTerrain = toTerrain(index < 5 ? 'pasture' : 'tree');
      return acc.withTile(
        neighborTileFacingInward(`n-${direction}`, inwardEdgeDirection, inwardEdgeTerrain),
        coordinate
      );
    }, new Board());
    const centerTile = createTile('center', 'pasture');

    // Act
    const { board: updatedBoard, placedTile } = boardWithRing.place(centerTile, center);
    const result = scorer.scorePlacement(updatedBoard, placedTile);

    // Assert
    expect(result.scoreAdded).toBe(50);
    expect(result.perfectCount).toBe(0);
  });

  it('should score 70 (10 match + 60 perfect) when a neighbor becomes perfect', () => {
    // Arrange
    const northCoord = north(center);
    const centerTile = createTile('center', 'pasture');
    const boardWithCenter = Board.withTile(centerTile, center);
    const boardWithNeighbors = getNeighbors(center).reduce<Board>(
      (acc, { direction, coordinate }) => {
        if (direction === 'north') return acc;
        const inwardEdgeDirection = getOpposite(direction);
        const inwardEdgeTerrain = toTerrain('pasture');
        return acc.withTile(
          neighborTileFacingInward(`n-${direction}`, inwardEdgeDirection, inwardEdgeTerrain),
          coordinate
        );
      },
      boardWithCenter
    );
    const northTile = new Tile({
      id: 'north',
      north: toTerrain('pasture'),
      northEast: toTerrain('pasture'),
      southEast: toTerrain('tree'),
      south: toTerrain('pasture'),
      southWest: toTerrain('tree'),
      northWest: toTerrain('pasture'),
    });

    // Act
    const { board: updatedBoard, placedTile } = boardWithNeighbors.place(northTile, northCoord);
    const result = scorer.scorePlacement(updatedBoard, placedTile);

    // Assert
    expect(result.scoreAdded).toBe(70);
    expect(result.perfectCount).toBe(1);
  });

  it('should score multiple perfect bonuses if one placement completes multiple neighbors', () => {
    // Arrange
    const northCoord = north(center);
    const northEastCoord = northEast(center);
    const boardWithNeighbors = new Board()
      .withTile(createTile('north', 'pasture'), northCoord)
      .withTile(createTile('northEast', 'pasture'), northEastCoord);
    const boardAfterNorth = surroundExceptCenter(boardWithNeighbors, northCoord, 'n');
    const boardAfterBoth = surroundExceptCenter(boardAfterNorth, northEastCoord, 'ne');
    const centerTile = createTile('center', 'pasture');

    // Act
    const { board: updatedBoard, placedTile } = boardAfterBoth.place(centerTile, center);
    const result = scorer.scorePlacement(updatedBoard, placedTile);

    // Assert
    expect(result.perfectCount).toBe(2);
    expect(result.scoreAdded).toBeGreaterThanOrEqual(140);
  });

  describe('isPerfect', () => {
    it('should return false for a lone tile', () => {
      const { board: updatedBoard, placedTile } = new Board().place(createTile('t1'), center);
      const result = scorer.isPerfect(updatedBoard, placedTile);
      expect(result).toBe(false);
    });

    it('should return false if tile has fewer than 6 neighbors', () => {
      // Arrange
      const { board: updatedBoard, placedTile } = new Board().place(createTile('center'), center);
      const currentBoard = getNeighbors(center)
        .slice(0, 3)
        .reduce<Board>(
          (acc, { coordinate }, i) => acc.withTile(createTile(`n${i}`), coordinate),
          updatedBoard
        );

      // Act
      const result = scorer.isPerfect(currentBoard, placedTile);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false if 6 neighbors exist but one terrain mismatches', () => {
      // Arrange
      const { board: updatedBoard, placedTile } = new Board().place(
        createTile('center', 'pasture'),
        center
      );
      const currentBoard = getNeighbors(center).reduce<Board>(
        (acc, { direction, coordinate }, i) => {
          const inwardEdgeDirection = getOpposite(direction);
          const inwardEdgeTerrain = i === 5 ? toTerrain('tree') : toTerrain('pasture');
          return acc.withTile(
            neighborTileFacingInward(`n${i}`, inwardEdgeDirection, inwardEdgeTerrain),
            coordinate
          );
        },
        updatedBoard
      );

      // Act
      const result = scorer.isPerfect(currentBoard, placedTile);

      // Assert
      expect(result).toBe(false);
    });

    it('should return true if 6 neighbors exist and all terrains match', () => {
      // Arrange
      const { board: updatedBoard, placedTile } = new Board().place(
        createTile('center', 'pasture'),
        center
      );
      const currentBoard = getNeighbors(center).reduce<Board>(
        (acc, { direction, coordinate }, i) => {
          const inwardEdgeDirection = getOpposite(direction);
          const inwardEdgeTerrain = toTerrain('pasture');
          return acc.withTile(
            neighborTileFacingInward(`n${i}`, inwardEdgeDirection, inwardEdgeTerrain),
            coordinate
          );
        },
        updatedBoard
      );

      // Act
      const result = scorer.isPerfect(currentBoard, placedTile);

      // Assert
      expect(result).toBe(true);
    });
  });
});
