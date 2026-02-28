import { describe, it, expect } from 'vitest';
import { 
  north, 
  northEast, 
  southEast, 
  south, 
  southWest, 
  northWest, 
  getNeighbors, 
  getOpposite 
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
    
    const directions = neighbors.map(n => n.direction);
    expect(directions).toContain('north');
    expect(directions).toContain('south');
    expect(directions).toContain('northEast');
    expect(directions).toContain('southEast');
    expect(directions).toContain('northWest');
    expect(directions).toContain('southWest');
  });

  it('correctly identifies opposite directions', () => {
    expect(getOpposite('north')).toBe('south');
    expect(getOpposite('south')).toBe('north');
    expect(getOpposite('northEast')).toBe('southWest');
    expect(getOpposite('southWest')).toBe('northEast');
    expect(getOpposite('northWest')).toBe('southEast');
    expect(getOpposite('southEast')).toBe('northWest');
  });
});
