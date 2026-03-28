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
    // 1. Setup a basic game
    const rules = GameRules.createStandard();
    const game = Game.create(rules);

    // Give the game a custom name and change the score to ensure those fields are captured
    Object.assign(game, { name: 'Test Serialization Game', score: 100 });

    // 2. Serialize
    const json: GameJSON = GameSerializer.serialize(game);

    // Basic structural checks on the JSON
    expect(json.id).toBe(game.id);
    expect(json.name).toBe('Test Serialization Game');
    expect(json.score).toBe(100);
    expect(json.rules.initialTurns).toBe(30);
    expect(json.board.tiles).toBeInstanceOf(Array);
    expect(json.board.tiles.length).toBe(1); // Should have the starting tile
    expect(json.tileQueue).toBeInstanceOf(Array);
    expect(json.tileQueue.length).toBe(30);

    // 3. Deserialize
    const restoredGame: Game = GameSerializer.deserialize(json);

    // 4. Verification
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
    // 1. Setup a game and play a few turns
    const rules = GameRules.createTest();
    const game = Game.create(rules);

    // Place a tile
    game.placeTile(new HexCoordinate(1, -1, 0));
    game.placeTile(new HexCoordinate(0, -1, 1));
    game.placeTile(new HexCoordinate(-1, 0, 1));
    game.placeTile(new HexCoordinate(-1, 1, 0));

    // 2. Serialize
    const json: GameJSON = GameSerializer.serialize(game);

    // We expect 1 initial tile + 4 placed tiles
    expect(json.board.tiles.length).toBe(5);

    // 3. Deserialize
    const restoredGame: Game = GameSerializer.deserialize(json);

    // 4. Verification
    expect(restoredGame.board.has(new HexCoordinate(1, -1, 0))).toBe(true);
    expect(restoredGame.board.has(new HexCoordinate(0, -1, 1))).toBe(true);
    expect(restoredGame.board.has(new HexCoordinate(-1, 0, 1))).toBe(true);
    expect(restoredGame.board.has(new HexCoordinate(-1, 1, 0))).toBe(true);

    // Verify it functions correctly after deserialization (state isn't frozen/corrupt)
    expect(() => {
      restoredGame.placeTile(new HexCoordinate(0, 1, -1));
    }).not.toThrow();

    // After placing another tile, board size should increase
    expect(Array.from(restoredGame.board.getAll()).length).toBe(6);
  });

  it('preserves optional center terrain on serialization', () => {
    const board = new Board();
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
    board.place(centered, new HexCoordinate(0, 0, 0));

    const game = new Game({
      id: 'game-center',
      name: 'Center Test',
      board,
      tileQueue: [centered],
      rules: GameRules.createTest(),
    });

    const json = GameSerializer.serialize(game);
    expect(json.board.tiles[0].tile.center).toBe('house');
    expect(json.tileQueue[0].center).toBe('house');

    const restored = GameSerializer.deserialize(json);
    const restoredTile = restored.board.get(new HexCoordinate(0, 0, 0))?.tile;
    expect(restoredTile?.center?.id).toBe('house');
  });
});
