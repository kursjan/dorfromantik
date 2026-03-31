import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Game } from './Game';
import { Board } from './Board';
import { GameRules, RandomTileGenerator, SequenceTileGenerator } from './GameRules';
import { Tile } from './Tile';
import { toTerrain } from './Terrain';
import { HexCoordinate } from './HexCoordinate';
import { GameScorer } from './GameScorer';
describe('Game', () => {
  let board: Board;
  let rules: GameRules;
  const randomGenerator = new RandomTileGenerator();
  beforeEach(() => {
    board = new Board();
    rules = new GameRules({
      initialTurns: 30,
    });
  });

  describe('Factory Methods', () => {
    it('should create a game with an initial tile placed at origin', () => {
      // Arrange
      const startTile = new Tile({
        id: 'custom-start',
        north: toTerrain('tree'),
        northEast: toTerrain('pasture'),
        southEast: toTerrain('pasture'),
        south: toTerrain('rail'),
        southWest: toTerrain('pasture'),
        northWest: toTerrain('pasture'),
      });
      const customRules = new GameRules({
        initialTurns: 10,
        initialTileGenerator: new SequenceTileGenerator([startTile]),
      });

      // Act
      const game = Game.create(customRules);

      // Assert
      expect(game.rules).toBe(customRules);
      expect(game.remainingTurns).toBe(10);
      // Verify initial tile is placed at origin
      const origin = new HexCoordinate(0, 0, 0);
      const placedTile = game.board.get(origin);
      expect(placedTile).toBeDefined();
      expect(placedTile?.tile).toBe(startTile);
    });

    it('should create a standard game with a pasture starter tile', () => {
      // Arrange
      const rules = GameRules.createStandard();

      // Act
      const game = Game.create(rules);
      const origin = new HexCoordinate(0, 0, 0);
      const placedTile = game.board.get(origin);

      // Assert
      expect(game.remainingTurns).toBe(30);
      expect(placedTile).toBeDefined();
      expect(placedTile!.tile.north.id).toBe('pasture');
      expect(placedTile!.tile.northEast.id).toBe('pasture');
      expect(placedTile!.tile.southEast.id).toBe('pasture');
      expect(placedTile!.tile.south.id).toBe('pasture');
      expect(placedTile!.tile.southWest.id).toBe('pasture');
      expect(placedTile!.tile.northWest.id).toBe('pasture');
    });
  });

  it('should peek the top of the queue without removing it', () => {
    // Arrange
    const tree = toTerrain('tree');
    const tile = new Tile({
      id: 't1',
      north: tree,
      northEast: tree,
      southEast: tree,
      south: tree,
      southWest: tree,
      northWest: tree,
    });
    const customRules = new GameRules({
      initialTurns: 1,
      tileGenerator: new SequenceTileGenerator([tile]),
    });

    // Act
    const game = Game.create(customRules);
    const peekedTile = game.peek();

    // Assert
    expect(peekedTile).toBe(tile);
    expect(game.remainingTurns).toBe(1);
  });

  describe('isValidPlacement', () => {
    it('should return false if the position is already occupied', () => {
      // Arrange
      const coord = new HexCoordinate(0, 0, 0);
      const boardWithOriginTile = board.withTile(randomGenerator.createTile('t1'), coord);
      const freeTile = new Tile({
        north: toTerrain('pasture'),
        northEast: toTerrain('pasture'),
        southEast: toTerrain('pasture'),
        south: toTerrain('pasture'),
        southWest: toTerrain('pasture'),
        northWest: toTerrain('pasture'),
      });
      const game = new Game({
        board: boardWithOriginTile,
        rules,
        tileQueue: [freeTile],
      });

      // Act
      const result = game.isValidPlacement(coord);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false if the position is not adjacent to any existing tile', () => {
      // Arrange
      const origin = new HexCoordinate(0, 0, 0);
      const boardWithOriginTile = board.withTile(randomGenerator.createTile('t1'), origin);
      const freeTile = new Tile({
        north: toTerrain('pasture'),
        northEast: toTerrain('pasture'),
        southEast: toTerrain('pasture'),
        south: toTerrain('pasture'),
        southWest: toTerrain('pasture'),
        northWest: toTerrain('pasture'),
      });
      const game = new Game({
        board: boardWithOriginTile,
        rules,
        tileQueue: [freeTile],
      });

      // (2, 0, -2) is not adjacent to (0, 0, 0)
      const farCoord = new HexCoordinate(2, 0, -2);

      // Act
      const result = game.isValidPlacement(farCoord);

      // Assert
      expect(result).toBe(false);
    });

    it('should return true if the position is empty and adjacent to an existing tile', () => {
      // Arrange
      const origin = new HexCoordinate(0, 0, 0);
      const pastureTile = new Tile({
        north: toTerrain('pasture'),
        northEast: toTerrain('pasture'),
        southEast: toTerrain('pasture'),
        south: toTerrain('pasture'),
        southWest: toTerrain('pasture'),
        northWest: toTerrain('pasture'),
      });
      const boardWithOriginTile = board.withTile(pastureTile, origin);
      const freeTile = new Tile({
        north: toTerrain('pasture'),
        northEast: toTerrain('pasture'),
        southEast: toTerrain('pasture'),
        south: toTerrain('pasture'),
        southWest: toTerrain('pasture'),
        northWest: toTerrain('pasture'),
      });
      const game = new Game({
        board: boardWithOriginTile,
        rules,
        tileQueue: [freeTile],
      });
      const adjCoord = new HexCoordinate(1, 0, -1);

      // Act
      const result = game.isValidPlacement(adjCoord);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('rotateQueuedTile', () => {
    it('should rotate the next tile in the queue clockwise and return the next game snapshot', () => {
      // Arrange
      const tile = new Tile({
        id: 't1',
        north: toTerrain('tree'),
        northEast: toTerrain('house'),
        southEast: toTerrain('water'),
        south: toTerrain('pasture'),
        southWest: toTerrain('rail'),
        northWest: toTerrain('field'),
      });
      const customRules = new GameRules({
        initialTurns: 1,
        tileGenerator: new SequenceTileGenerator([tile]),
      });
      const game = Game.create(customRules);

      // Act
      const nextGame = game.rotateQueuedTileClockwise();
      const rotated = nextGame.peek()!;

      // Assert
      expect(nextGame).not.toBe(game);
      expect(rotated.north.id).toBe('house');
      expect(nextGame.remainingTurns).toBe(1);
      expect(game.peek()).toBe(tile);
    });

    it('should rotate the next tile in the queue counter-clockwise and return the next game snapshot', () => {
      // Arrange
      const tile = new Tile({
        id: 't1',
        north: toTerrain('tree'),
        northEast: toTerrain('house'),
        southEast: toTerrain('water'),
        south: toTerrain('pasture'),
        southWest: toTerrain('rail'),
        northWest: toTerrain('field'),
      });
      const customRules = new GameRules({
        initialTurns: 1,
        tileGenerator: new SequenceTileGenerator([tile]),
      });
      const game = Game.create(customRules);

      // Act
      const nextGame = game.rotateQueuedTileCounterClockwise();
      const rotated = nextGame.peek()!;

      // Assert
      expect(nextGame).not.toBe(game);
      expect(rotated.north.id).toBe('field');
      expect(nextGame.remainingTurns).toBe(1);
      expect(game.peek()).toBe(tile);
    });

    it('should throw error if queue is empty', () => {
      const customRules = new GameRules({
        initialTurns: 0,
        tileGenerator: new SequenceTileGenerator([]),
      });
      const game = Game.create(customRules);
      const rotate = () => game.rotateQueuedTileClockwise();
      expect(rotate).toThrow('No tiles remaining in the queue');
    });
  });

  describe('placeTile', () => {
    it('should throw error if queue is empty', () => {
      const customRules = new GameRules({
        initialTurns: 0,
        tileGenerator: new SequenceTileGenerator([]),
      });
      const game = Game.create(customRules);
      const coord = new HexCoordinate(1, 0, -1);
      const placeTile = () => game.placeTile(coord);
      expect(placeTile).toThrow('No tiles remaining in the queue');
    });

    it('should place tile, call scorer, and return the next game snapshot with bonus tiles', () => {
      // Arrange
      const initialTile = randomGenerator.createTile('initial-tile');
      const expectedBonus1 = randomGenerator.createTile('bonus-1');
      const expectedBonus2 = randomGenerator.createTile('bonus-2');
      const customRules = new GameRules({
        initialTurns: 1,
        tileGenerator: new SequenceTileGenerator([initialTile, expectedBonus1, expectedBonus2]),
        turnsPerPerfect: 2,
      });
      const game = Game.create(customRules);
      const previousLastPlayed = game.lastPlayed;
      expect(game.tileQueue.length).toBe(1);
      expect(game.tileQueue[0]).toBe(initialTile);
      const scoreSpy = vi.spyOn(GameScorer.prototype, 'scorePlacement').mockReturnValue({
        scoreAdded: 100,
        perfectCount: 1,
      });
      const coord = new HexCoordinate(1, 0, -1);

      // Act
      const result = game.placeTile(coord);
      const nextGame = result.game;

      // Assert
      expect(result.scoreAdded).toBe(100);
      expect(result.perfectCount).toBe(1);
      expect(nextGame).not.toBe(game);
      expect(Date.parse(nextGame.lastPlayed)).toBeGreaterThanOrEqual(
        Date.parse(previousLastPlayed)
      );
      expect(nextGame.score).toBe(100);
      expect(nextGame.tileQueue.length).toBe(2);
      expect(nextGame.tileQueue[0]).toBe(expectedBonus1);
      expect(nextGame.tileQueue[1]).toBe(expectedBonus2);
      expect(game.score).toBe(0);
      expect(game.remainingTurns).toBe(1);
      expect(game.board.get(coord)).toBeUndefined();
      scoreSpy.mockRestore();
    });
  });
});
