import { describe, it, expect } from 'vitest';
import { HexCoordinate } from './HexCoordinate';
import { Game } from './Game';
import { directions } from './Navigation';
import { GameRules, RandomTileGenerator } from './GameRules';

describe('GameRules', () => {
  it('should create GameRules with specified values', () => {
    const rules = new GameRules({
      initialTurns: 40,
      pointsPerMatch: 10,
      pointsPerPerfect: 60,
      turnsPerPerfect: 1,
    });

    expect(rules.initialTurns).toBe(40);
    expect(rules.pointsPerMatch).toBe(10);
    expect(rules.pointsPerPerfect).toBe(60);
    expect(rules.turnsPerPerfect).toBe(1);
  });

  it('should use default values if not provided', () => {
    const rules = new GameRules();
    expect(rules.initialTurns).toBe(40); // Default
    expect(rules.pointsPerMatch).toBe(10); // Default
    expect(rules.pointsPerPerfect).toBe(60); // Default
    expect(rules.turnsPerPerfect).toBe(1); // Default
  });

  it('should throw error if initialTurns is negative', () => {
    expect(() => new GameRules({ initialTurns: -1 })).toThrow('initialTurns must be non-negative');
  });

  it('should throw error if pointsPerMatch is negative', () => {
    expect(() => new GameRules({ pointsPerMatch: -1 })).toThrow(
      'pointsPerMatch must be non-negative'
    );
  });

  it('should throw error if pointsPerPerfect is negative', () => {
    expect(() => new GameRules({ pointsPerPerfect: -1 })).toThrow(
      'pointsPerPerfect must be non-negative'
    );
  });

  it('should throw error if turnsPerPerfect is negative', () => {
    expect(() => new GameRules({ turnsPerPerfect: -1 })).toThrow(
      'turnsPerPerfect must be non-negative'
    );
  });
});

describe('GameRules.createTest2', () => {
  it('places a starter with water center and mixed water/pasture edges; queue is pasture with one water edge', () => {
    const rules = GameRules.createTest2();
    const game = Game.create(rules);
    const origin = new HexCoordinate(0, 0, 0);
    const start = game.board.get(origin)!.tile;

    expect(start.center?.id).toBe('water');
    let waterEdges = 0;
    let pastureEdges = 0;
    for (const d of directions) {
      const id = start.getTerrain(d).id;
      if (id === 'water') waterEdges++;
      if (id === 'pasture') pastureEdges++;
    }
    expect(waterEdges).toBe(3);
    expect(pastureEdges).toBe(3);

    const next = game.peek()!;
    let waterCount = 0;
    for (const d of directions) {
      if (next.getTerrain(d).id === 'water') waterCount++;
    }
    expect(waterCount).toBe(1);
    expect(next.north.id).toBe('water');
    for (const d of directions) {
      if (d === 'north') continue;
      expect(next.getTerrain(d).id).toBe('pasture');
    }
  });
});

describe('RandomTileGenerator', () => {
  it('should generate unique IDs', () => {
    const generator = new RandomTileGenerator();
    const tile1 = generator.createTile();
    const tile2 = generator.createTile();

    expect(tile1.id).not.toBe(tile2.id);
    expect(tile1.id).toMatch(/^tile-gen-\d+-[a-z0-9]{6}$/);
    expect(tile2.id).toMatch(/^tile-gen-\d+-[a-z0-9]{6}$/);
  });

  it('should use provided ID if supplied', () => {
    const generator = new RandomTileGenerator();
    const tile = generator.createTile('custom-id');
    expect(tile.id).toBe('custom-id');
  });
});
