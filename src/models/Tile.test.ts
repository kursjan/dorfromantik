import { describe, it, expect, vi } from 'vitest';
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

    const consoleSpy = vi.spyOn(console, 'log');
    tile.print();

    //    _ _
    //  /  T  \
    // /F     H\
    // \R     W/
    //  \ _P_ /

    expect(consoleSpy).toHaveBeenCalledWith('Tile test-tile:');
    expect(consoleSpy).toHaveBeenCalledWith('    _ _');
    expect(consoleSpy).toHaveBeenCalledWith('  /  T  \\');
    expect(consoleSpy).toHaveBeenCalledWith(' /F     H\\');
    expect(consoleSpy).toHaveBeenCalledWith(' \\R     W/');
    expect(consoleSpy).toHaveBeenCalledWith('  \\ _P_ /');

    consoleSpy.mockRestore();
  });
});
