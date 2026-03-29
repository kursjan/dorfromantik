import { describe, it, expect } from 'vitest';
import { BoardNavigation } from './BoardNavigation';
import { Board } from './Board';
import { HexCoordinate } from './HexCoordinate';
import { getNeighbor, getOpposite, type Direction } from './Navigation';
import { Tile, type TileTerrainOptions } from './Tile';
import { toTerrain } from './Terrain';

describe('BoardNavigation', () => {
  it('neighborEdgeTerrains maps opposite-edge terrain from each placed neighbor', () => {
    const board = new Board();
    const center = new HexCoordinate(0, 0, 0);
    const fromCenter: Direction = 'north';
    const neighborCoord = getNeighbor(center, fromCenter);
    const edgeOnNeighborFacingCenter = getOpposite(fromCenter);

    const tileOpts: TileTerrainOptions = { id: 'n' };
    tileOpts[edgeOnNeighborFacingCenter] = toTerrain('water');
    board.place(new Tile(tileOpts), neighborCoord);

    const map = BoardNavigation.neighborEdgeTerrains(board, center);

    expect(map[fromCenter]?.id).toBe('water');
  });
});
