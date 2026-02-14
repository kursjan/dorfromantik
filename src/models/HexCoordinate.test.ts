import { describe, it, expect } from 'vitest';
import { HexCoordinate } from './HexCoordinate';

describe('HexCoordinate', () => {
  it('creates valid coordinates', () => {
    const coord = new HexCoordinate(1, -1, 0);
    expect(coord.q).toBe(1);
    expect(coord.r).toBe(-1);
    expect(coord.s).toBe(0);
  });

  it('throws error for invalid coordinates', () => {
    expect(() => {
      new HexCoordinate(1, 1, 1);
    }).toThrow('Invalid HexCoordinate: 1,1,1. Sum must be 0.');
  });

  it('throws error for non-integer coordinates', () => {
    expect(() => {
      new HexCoordinate(1.5, -1.5, 0);
    }).toThrow('Invalid HexCoordinate: 1.5,-1.5,0. Coordinates must be integers.');
  });

  it('checks equality correctly', () => {
    const coord1 = new HexCoordinate(1, -1, 0);
    const coord2 = new HexCoordinate(1, -1, 0);
    const coord3 = new HexCoordinate(0, 0, 0);

    expect(coord1.equals(coord2)).toBe(true);
    expect(coord1.equals(coord3)).toBe(false);
  });
});
