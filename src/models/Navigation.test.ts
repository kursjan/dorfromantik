import { describe, it, expect } from 'vitest';
import {
  Direction,
  north,
  northEast,
  southEast,
  south,
  southWest,
  northWest,
  getNeighbors,
  getOpposite,
} from './Navigation';
import { HexCoordinate } from './HexCoordinate';

describe('Navigation', () => {
  const center = new HexCoordinate(0, 0, 0);

  it('navigates North', () => {
    const result = north(center);
    expect(result.q).toBe(-1);
    expect(result.r).toBe(0);
    expect(result.s).toBe(1);
  });

  it('navigates NorthEast', () => {
    const result = northEast(center);
    expect(result.q).toBe(-1);
    expect(result.r).toBe(1);
    expect(result.s).toBe(0);
  });

  it('navigates SouthEast', () => {
    const result = southEast(center);
    expect(result.q).toBe(0);
    expect(result.r).toBe(1);
    expect(result.s).toBe(-1);
  });

  it('navigates South', () => {
    const result = south(center);
    expect(result.q).toBe(1);
    expect(result.r).toBe(0);
    expect(result.s).toBe(-1);
  });

  it('navigates SouthWest', () => {
    const result = southWest(center);
    expect(result.q).toBe(1);
    expect(result.r).toBe(-1);
    expect(result.s).toBe(0);
  });

  it('navigates NorthWest', () => {
    const result = northWest(center);
    expect(result.q).toBe(0);
    expect(result.r).toBe(-1);
    expect(result.s).toBe(1);
  });

  it('navigates NorthWest from specific coordinate (3, 6, -9)', () => {
    const start = new HexCoordinate(3, 6, -9);
    const result = northWest(start);
    expect(result.q).toBe(3);
    expect(result.r).toBe(5);
    expect(result.s).toBe(-8);
  });

  it('provides all 6 neighbors', () => {
    const neighbors = getNeighbors(center);
    expect(neighbors.length).toBe(6);

    const neighborDirections = neighbors.map((n) => n.direction);
    expect(neighborDirections).toContain(Direction.North);
    expect(neighborDirections).toContain(Direction.South);
    expect(neighborDirections).toContain(Direction.NorthEast);
    expect(neighborDirections).toContain(Direction.SouthEast);
    expect(neighborDirections).toContain(Direction.NorthWest);
    expect(neighborDirections).toContain(Direction.SouthWest);
  });

  it('correctly identifies opposite directions', () => {
    expect(getOpposite(Direction.North)).toBe(Direction.South);
    expect(getOpposite(Direction.South)).toBe(Direction.North);
    expect(getOpposite(Direction.NorthEast)).toBe(Direction.SouthWest);
    expect(getOpposite(Direction.SouthWest)).toBe(Direction.NorthEast);
    expect(getOpposite(Direction.NorthWest)).toBe(Direction.SouthEast);
    expect(getOpposite(Direction.SouthEast)).toBe(Direction.NorthWest);
  });
});
