import { describe, it, expect } from 'vitest';
import { Tile } from './Tile';

describe('Tile', () => {
  it('prints its sides correctly', () => {
    const tile = new Tile({
      id: 'test-tile',
      north: 'tree',
      northEast: 'house',
      southEast: 'water',
      south: 'pasture',
      southWest: 'rail',
      northWest: 'field',
    });

    const expected = `Tile test-tile:
    _ _
  /  T  \\
 /F     H\\
 \\R     W/
  \\ _P_ /`;

    expect(tile.print()).toBe(expected);
  });

  it('supports an optional center terrain', () => {
    const tile = new Tile({
      id: 'center-tile',
      center: 'water',
      north: 'tree',
      northEast: 'house',
      southEast: 'water',
      south: 'pasture',
      southWest: 'rail',
      northWest: 'field',
    });

    expect(tile.center?.name).toBe('water');
    expect(tile.rotateClockwise().center?.name).toBe('water');
    expect(tile.rotateCounterClockwise().center?.name).toBe('water');
    expect(tile.print()).toContain('/F  W  H\\');
  });

  it('throws when an invalid terrain input is provided', () => {
    expect(() => new Tile({ north: 'invalid-terrain' as any })).toThrow(
      'Invalid tile: "north" must be a terrain instance',
    );
  });

  describe('Rotation', () => {
    const tile = new Tile({
      id: 'rotation-tile',
      north: 'tree',
      northEast: 'house',
      southEast: 'water',
      south: 'pasture',
      southWest: 'rail',
      northWest: 'field',
    });

    it('rotates clockwise correctly', () => {
      const rotated = tile.rotateClockwise();
      
      expect(rotated.id).toBe(tile.id);
      expect(rotated.north.name).toBe('house');
      expect(rotated.northEast.name).toBe('water');
      expect(rotated.southEast.name).toBe('pasture');
      expect(rotated.south.name).toBe('rail');
      expect(rotated.southWest.name).toBe('field');
      expect(rotated.northWest.name).toBe('tree');
    });

    it('rotates counter-clockwise correctly', () => {
      const rotated = tile.rotateCounterClockwise();
      
      expect(rotated.id).toBe(tile.id);
      expect(rotated.north.name).toBe('field');
      expect(rotated.northEast.name).toBe('tree');
      expect(rotated.southEast.name).toBe('house');
      expect(rotated.south.name).toBe('water');
      expect(rotated.southWest.name).toBe('pasture');
      expect(rotated.northWest.name).toBe('rail');
    });

    it('returns a new instance', () => {
      const rotated = tile.rotateClockwise();
      expect(rotated).not.toBe(tile);
    });

    it('full 360 degree rotation returns to original state', () => {
      let current = tile;
      for (let i = 0; i < 6; i++) {
        current = current.rotateClockwise();
      }
      
      expect(current.north).toBe(tile.north);
      expect(current.northEast).toBe(tile.northEast);
      expect(current.southEast).toBe(tile.southEast);
      expect(current.south).toBe(tile.south);
      expect(current.southWest).toBe(tile.southWest);
      expect(current.northWest).toBe(tile.northWest);
    });
  });
});
