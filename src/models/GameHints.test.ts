import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameHints } from './GameHints';
import { Board } from './Board';
import { HexCoordinate } from './HexCoordinate';
import { Tile } from './Tile';
import { toTerrain } from './Terrain';

describe('GameHints', () => {
  let board: Board;
  let mockTile: Tile;

  beforeEach(() => {
    board = new Board();
    mockTile = new Tile({
      id: 'mock-tile',
      north: toTerrain('tree'),
      northEast: toTerrain('house'),
      southEast: toTerrain('water'),
      south: toTerrain('pasture'),
      southWest: toTerrain('rail'),
      northWest: toTerrain('field'),
    });
  });

  it('computes validPlacements on initialization and is immutable', () => {
    const mockValidPlacements = [new HexCoordinate(1, 0, -1)];
    const spy = vi
      .spyOn(board, 'getValidPlacementCoordinates')
      .mockReturnValue(mockValidPlacements);

    const gameHints = new GameHints(board, mockTile);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(gameHints.validPlacements).toEqual(mockValidPlacements);

    // Ensure array is frozen
    expect(Object.isFrozen(gameHints.validPlacements)).toBe(true);
  });

  it('returns empty array and does not query board when currentTile is null', () => {
    const spy = vi.spyOn(board, 'getValidPlacementCoordinates');

    const gameHints = new GameHints(board, null);

    expect(spy).not.toHaveBeenCalled();
    expect(gameHints.validPlacements).toEqual([]);
    expect(Object.isFrozen(gameHints.validPlacements)).toBe(true);
  });
});
