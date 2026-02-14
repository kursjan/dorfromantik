import { describe, it, expect, vi } from 'vitest';
import { Tile } from '../models/Tile';

describe('Tile', () => {
  it('prints its sides correctly', () => {
    const tile = new Tile({
      id: 'test-tile',
      northEast: 'tree',
      east: 'house',
      southEast: 'water',
      southWest: 'pasture',
      west: 'rail',
      northWest: 'field',
    });

    const consoleSpy = vi.spyOn(console, 'log');
    tile.print();

    //    f -- t
    //   /      \
    //  r        h
    //   \      /
    //    p -- w

    expect(consoleSpy).toHaveBeenCalledWith('Tile test-tile:');
    expect(consoleSpy).toHaveBeenCalledWith('   f -- t');
    expect(consoleSpy).toHaveBeenCalledWith('  /      \\');
    expect(consoleSpy).toHaveBeenCalledWith(' r        h');
    expect(consoleSpy).toHaveBeenCalledWith('  \\      /');
    expect(consoleSpy).toHaveBeenCalledWith('   p -- w');

    consoleSpy.mockRestore();
  });
});
