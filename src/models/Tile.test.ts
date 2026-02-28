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
      expect(rotated.north).toBe('house');
      expect(rotated.northEast).toBe('water');
      expect(rotated.southEast).toBe('pasture');
      expect(rotated.south).toBe('rail');
      expect(rotated.southWest).toBe('field');
      expect(rotated.northWest).toBe('tree');
    });

    it('rotates counter-clockwise correctly', () => {
      const rotated = tile.rotateCounterClockwise();
      
      expect(rotated.id).toBe(tile.id);
      expect(rotated.north).toBe('field');
      expect(rotated.northEast).toBe('tree');
      expect(rotated.southEast).toBe('house');
      expect(rotated.south).toBe('water');
      expect(rotated.southWest).toBe('pasture');
      expect(rotated.northWest).toBe('rail');
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
