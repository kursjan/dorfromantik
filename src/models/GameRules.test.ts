import { describe, it, expect } from 'vitest';
import { GameRules } from './GameRules';

describe('GameRules', () => {
  it('should create GameRules with specified values', () => {
    const rules = new GameRules({
      initialTurns: 40,
      pointsPerMatch: 10,
    });

    expect(rules.initialTurns).toBe(40);
    expect(rules.pointsPerMatch).toBe(10);
  });

  it('should use default values if not provided', () => {
    const rules = new GameRules();
    expect(rules.initialTurns).toBe(40); // Default
    expect(rules.pointsPerMatch).toBe(10); // Default
  });

  it('should throw error if initialTurns is negative', () => {
    expect(() => new GameRules({ initialTurns: -1 })).toThrow('initialTurns must be non-negative');
  });

  it('should throw error if pointsPerMatch is negative', () => {
    expect(() => new GameRules({ pointsPerMatch: -1 })).toThrow('pointsPerMatch must be non-negative');
  });
});
