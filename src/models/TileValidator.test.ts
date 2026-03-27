import { describe, expect, it } from 'vitest';
import { Tile } from './Tile';
import { TileValidator } from './TileValidator';
import { WaterOrPastureTerrain, WaterTerrain } from './Terrain';

describe('TileValidator', () => {
  it('accepts a valid tile', () => {
    const tile = new Tile({
      id: 'valid-tile',
      center: 'water',
      north: 'tree',
      northEast: 'house',
      southEast: 'water',
      south: 'pasture',
      southWest: 'rail',
      northWest: 'field',
    });

    const validator = new TileValidator();
    expect(() => validator.validate(tile)).not.toThrow();
  });

  it('throws if a required side is invalid', () => {
    const tile = new Tile({ id: 'invalid-side' }) as unknown as Record<string, unknown>;
    tile.north = 'not-a-terrain';

    const validator = new TileValidator();
    expect(() => validator.validate(tile as unknown as Tile)).toThrow(
      'Invalid tile: "north" must be a terrain instance'
    );
  });

  it('throws if center is invalid', () => {
    const tile = new Tile({ id: 'invalid-center' }) as unknown as Record<string, unknown>;
    tile.center = 'not-a-terrain';

    const validator = new TileValidator();
    expect(() => validator.validate(tile as unknown as Tile)).toThrow(
      'Invalid tile: "center" must be a terrain instance when provided'
    );
  });

  it('throws when linked water side has non-water center', () => {
    expect(
      () =>
        new Tile({
          id: 'linked-water-invalid',
          center: 'tree',
          north: new WaterTerrain(true),
          northEast: 'house',
          southEast: 'water',
          south: 'pasture',
          southWest: 'rail',
          northWest: 'field',
        })
    ).toThrow(
      'Invalid tile: "north" terrain with linkToCenter=true requires center terrain to be water'
    );
  });

  it('throws when waterOrPasture has linkToCenter but center is not water', () => {
    expect(
      () =>
        new Tile({
          id: 'wop-linked',
          center: 'pasture',
          north: new WaterOrPastureTerrain(true),
          northEast: 'house',
          southEast: 'water',
          south: 'pasture',
          southWest: 'rail',
          northWest: 'field',
        })
    ).toThrow(
      'Invalid tile: "north" terrain with linkToCenter=true requires center terrain to be water'
    );
  });

  it('accepts linked water side when center is water', () => {
    const validator = new TileValidator();
    const tile = new Tile({
      id: 'linked-water-valid',
      center: 'water',
      north: new WaterTerrain(true),
      northEast: 'house',
      southEast: 'water',
      south: 'pasture',
      southWest: 'rail',
      northWest: 'field',
    });

    expect(() => validator.validate(tile)).not.toThrow();
  });
});
