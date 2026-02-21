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

  it('navigates NorthWest from specific coordinate (3, 6, -9)', () => {
    const start = new HexCoordinate(3, 6, -9);
    const result = navigation.northWest(start);
    expect(result.q).toBe(3);
    expect(result.r).toBe(5);
    expect(result.s).toBe(-8); 
  });

  it('provides all 6 neighbors', () => {
    const neighbors = navigation.getNeighbors(center);
    expect(neighbors.length).toBe(6);
    
    const directions = neighbors.map(n => n.direction);
    expect(directions).toContain('north');
    expect(directions).toContain('south');
    expect(directions).toContain('northEast');
    expect(directions).toContain('southEast');
    expect(directions).toContain('northWest');
    expect(directions).toContain('southWest');
  });

  it('correctly identifies opposite directions', () => {
    expect(navigation.getOpposite('north')).toBe('south');
    expect(navigation.getOpposite('south')).toBe('north');
    expect(navigation.getOpposite('northEast')).toBe('southWest');
    expect(navigation.getOpposite('southWest')).toBe('northEast');
    expect(navigation.getOpposite('northWest')).toBe('southEast');
    expect(navigation.getOpposite('southEast')).toBe('northWest');
  });
});
