import { describe, it, expect } from 'vitest';
import { GameSerializer, type GameJSON } from './GameSerializer';
import { Game } from './Game';
import { GameRules } from './GameRules';
import { Tile } from './Tile';
import { HexCoordinate } from './HexCoordinate';
import { Board } from './Board';
import { toTerrain } from './Terrain';
describe('GameSerializer', () => {
  it('should accurately serialize and deserialize a new game', () => {
    // Arrange
    const rules = GameRules.createStandard();
    const created = Game.create(rules);
    // Immutable-style snapshot: new Game instance with updated metadata
    const game = new Game({
      id: created.id,
      name: 'Test Serialization Game',
      lastPlayed: created.lastPlayed,
      board: created.board,
      rules: created.rules,
      score: 100,
      tileQueue: created.tileQueue,
    });

    // Act
    const json: GameJSON = GameSerializer.serialize(game);
    const restoredGame: Game = GameSerializer.deserialize(json);

    // Assert
    expect(json.id).toBe(game.id);
    expect(json.name).toBe('Test Serialization Game');
    expect(json.score).toBe(100);
    expect(json.rules.initialTurns).toBe(30);
    expect(json.board.tiles).toBeInstanceOf(Array);
    expect(json.board.tiles.length).toBe(1); // Should have the starting tile
    expect(json.tileQueue).toBeInstanceOf(Array);
    expect(json.tileQueue.length).toBe(30);
    expect(restoredGame).toBeInstanceOf(Game);
    expect(restoredGame.id).toBe(game.id);
    expect(restoredGame.name).toBe(game.name);
    expect(restoredGame.score).toBe(game.score);
    expect(restoredGame.lastPlayed).toBe(game.lastPlayed);
    // Check Rules
    expect(restoredGame.rules).toBeInstanceOf(GameRules);
    expect(restoredGame.rules.initialTurns).toBe(game.rules.initialTurns);
    // Check Board
    // A restored board should have identical tiles at identical coordinates
    const originalTiles = Array.from(game.board.getAll());
    const restoredTiles = Array.from(restoredGame.board.getAll());
    expect(restoredTiles.length).toBe(originalTiles.length);
    for (let i = 0; i < originalTiles.length; i++) {
      const orig = originalTiles[i];
      const rest = restoredTiles[i];
      expect(rest.coordinate).toBeInstanceOf(HexCoordinate);
      expect(rest.coordinate.equals(orig.coordinate)).toBe(true);
      expect(rest.tile).toBeInstanceOf(Tile);
      expect(rest.tile.id).toBe(orig.tile.id);
      expect(rest.tile.getTerrains()).toEqual(orig.tile.getTerrains());
    }
    // Check Queue
    expect(restoredGame.tileQueue.length).toBe(game.tileQueue.length);
    for (let i = 0; i < game.tileQueue.length; i++) {
      const origTile = game.tileQueue[i];
      const restTile = restoredGame.tileQueue[i];
      expect(restTile).toBeInstanceOf(Tile);
      expect(restTile.id).toBe(origTile.id);
      expect(restTile.getTerrains()).toEqual(origTile.getTerrains());
    }
  });

  it('should accurately serialize and deserialize an in-progress game with placed tiles', () => {
    // Arrange
    const rules = GameRules.createTest();
    let game = Game.create(rules);
    // Chain placements via returned snapshots (aligns with immutable game transitions)
    game = game.placeTile(new HexCoordinate(1, -1, 0)).game;
    game = game.placeTile(new HexCoordinate(0, -1, 1)).game;
    game = game.placeTile(new HexCoordinate(-1, 0, 1)).game;
    game = game.placeTile(new HexCoordinate(-1, 1, 0)).game;

    // Act
    const json: GameJSON = GameSerializer.serialize(game);
    const restoredGame: Game = GameSerializer.deserialize(json);
    const afterRestore = restoredGame.placeTile(new HexCoordinate(0, 1, -1));

    // Assert
    expect(json.board.tiles.length).toBe(5);
    expect(restoredGame.board.has(new HexCoordinate(1, -1, 0))).toBe(true);
    expect(restoredGame.board.has(new HexCoordinate(0, -1, 1))).toBe(true);
    expect(restoredGame.board.has(new HexCoordinate(-1, 0, 1))).toBe(true);
    expect(restoredGame.board.has(new HexCoordinate(-1, 1, 0))).toBe(true);
    expect(Array.from(afterRestore.game.board.getAll()).length).toBe(6);
  });

  it('deserialize returns a new Game instance independent of the serialized object', () => {
    const game = Game.create(GameRules.createStandard());
    const json = GameSerializer.serialize(game);
    const restored = GameSerializer.deserialize(json);
    expect(restored).not.toBe(game);
    expect(restored.board).not.toBe(game.board);
  });

  it('preserves optional center terrain on serialization', () => {
    // Arrange
    const centered = new Tile({
      id: 'centered',
      center: toTerrain('house'),
      north: toTerrain('tree'),
      northEast: toTerrain('water'),
      southEast: toTerrain('pasture'),
      south: toTerrain('field'),
      southWest: toTerrain('rail'),
      northWest: toTerrain('house'),
    });
    const board = Board.withTile(centered, new HexCoordinate(0, 0, 0));
    const game = new Game({
      id: 'game-center',
      name: 'Center Test',
      board,
      tileQueue: [centered],
      rules: GameRules.createTest(),
    });

    // Act
    const json = GameSerializer.serialize(game);
    const restored = GameSerializer.deserialize(json);
    const restoredTile = restored.board.get(new HexCoordinate(0, 0, 0))?.tile;

    // Assert
    expect(json.board.tiles[0].tile.center).toBe('house');
    expect(json.tileQueue[0].center).toBe('house');
    expect(restoredTile?.center?.id).toBe('house');
  });
});
