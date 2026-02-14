import { describe, it, expect } from 'vitest';
import { Navigation } from './Navigation';
import { HexCoordinate } from './HexCoordinate';

describe('Navigation', () => {
  const navigation = new Navigation();
  const center = new HexCoordinate(0, 0, 0);

  it('navigates North', () => {
    const result = navigation.north(center);
    expect(result.q).toBe(-1);
    expect(result.r).toBe(0);
    expect(result.s).toBe(1);
  });

  it('navigates NorthEast', () => {
    const result = navigation.northEast(center);
    expect(result.q).toBe(-1);
    expect(result.r).toBe(1);
    expect(result.s).toBe(0);
  });

  it('navigates SouthEast', () => {
    const result = navigation.southEast(center);
    expect(result.q).toBe(0);
    expect(result.r).toBe(1);
    expect(result.s).toBe(-1);
  });

  it('navigates South', () => {
    const result = navigation.south(center);
    expect(result.q).toBe(1);
    expect(result.r).toBe(0);
    expect(result.s).toBe(-1);
  });

  it('navigates SouthWest', () => {
    const result = navigation.southWest(center);
    expect(result.q).toBe(1);
    expect(result.r).toBe(-1);
    expect(result.s).toBe(0);
  });

  it('navigates NorthWest', () => {
    const result = navigation.northWest(center);
    expect(result.q).toBe(0);
    expect(result.r).toBe(-1);
    expect(result.s).toBe(1);
  });

  it('navigates NorthEast from specific coordinate (3, 6, -9)', () => {
    const start = new HexCoordinate(3, 6, -9);
    const result = navigation.northEast(start);
    expect(result.q).toBe(2);
    expect(result.r).toBe(7);
    expect(result.s).toBe(-9);
  });
});
