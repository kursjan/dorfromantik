import { describe, it, expect } from 'vitest';
import { BoardNavigation } from './BoardNavigation';
import { Board } from './Board';
import { HexCoordinate } from './HexCoordinate';
import { Direction, north } from './Navigation';
import { Tile, type TileTerrainOptions } from './Tile';
import { PastureTerrain, WaterTerrain } from './Terrain';

describe('BoardNavigation', () => {
  it('neighborEdgeTerrains maps opposite-edge terrain from each placed neighbor', () => {
    const board = new Board();
    const center = new HexCoordinate(0, 0, 0);

    const northNeighborTile: TileTerrainOptions = {
      id: 'north-neighbor',
      north: new PastureTerrain(),
      northEast: new PastureTerrain(),
      southEast: new PastureTerrain(),
      south: new WaterTerrain(),
      southWest: new PastureTerrain(),
      northWest: new PastureTerrain(),
    };
    board.place(new Tile(northNeighborTile), north(center));

    const map = BoardNavigation.neighborEdgeTerrains(board, center);

    expect(map[Direction.North]?.id).toBe('water');
    expect(map[Direction.NorthEast]).toBeUndefined();
    expect(map[Direction.SouthEast]).toBeUndefined();
    expect(map[Direction.South]).toBeUndefined();
    expect(map[Direction.SouthWest]).toBeUndefined();
    expect(map[Direction.NorthWest]).toBeUndefined();
  });

  it('neighborEdgeTerrains omits every direction when there is no neighbor tile', () => {
    const board = new Board();
    const center = new HexCoordinate(0, 0, 0);

    const map = BoardNavigation.neighborEdgeTerrains(board, center);

    expect(map).toEqual({});
  });
});
