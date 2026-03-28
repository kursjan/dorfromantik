import { describe, it, expect } from 'vitest';
import { Tile } from './Tile';
import { toTerrain } from './Terrain';

describe('Tile', () => {
  it('prints its sides correctly', () => {
    const tile = new Tile({
      id: 'test-tile',
      north: toTerrain('tree'),
      northEast: toTerrain('house'),
      southEast: toTerrain('water'),
      south: toTerrain('pasture'),
      southWest: toTerrain('rail'),
      northWest: toTerrain('field'),
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
      center: toTerrain('water'),
      north: toTerrain('tree'),
      northEast: toTerrain('house'),
      southEast: toTerrain('water'),
      south: toTerrain('pasture'),
      southWest: toTerrain('rail'),
      northWest: toTerrain('field'),
    });

    expect(tile.center?.id).toBe('water');
    expect(tile.rotateClockwise().center?.id).toBe('water');
    expect(tile.rotateCounterClockwise().center?.id).toBe('water');
    expect(tile.print()).toContain('/F  W  H\\');
  });

  it('throws when an invalid terrain input is provided', () => {
    expect(() => new Tile({ north: {} as any })).toThrow(
      'Invalid tile: "north" must be a terrain instance'
    );
  });

  describe('Rotation', () => {
    const tile = new Tile({
      id: 'rotation-tile',
      north: toTerrain('tree'),
      northEast: toTerrain('house'),
      southEast: toTerrain('water'),
      south: toTerrain('pasture'),
      southWest: toTerrain('rail'),
      northWest: toTerrain('field'),
    });

    it('rotates clockwise correctly', () => {
      const rotated = tile.rotateClockwise();

      expect(rotated.id).toBe(tile.id);
      expect(rotated.north.id).toBe('house');
      expect(rotated.northEast.id).toBe('water');
      expect(rotated.southEast.id).toBe('pasture');
      expect(rotated.south.id).toBe('rail');
      expect(rotated.southWest.id).toBe('field');
      expect(rotated.northWest.id).toBe('tree');
    });

    it('rotates counter-clockwise correctly', () => {
      const rotated = tile.rotateCounterClockwise();

      expect(rotated.id).toBe(tile.id);
      expect(rotated.north.id).toBe('field');
      expect(rotated.northEast.id).toBe('tree');
      expect(rotated.southEast.id).toBe('house');
      expect(rotated.south.id).toBe('water');
      expect(rotated.southWest.id).toBe('pasture');
      expect(rotated.northWest.id).toBe('rail');
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
