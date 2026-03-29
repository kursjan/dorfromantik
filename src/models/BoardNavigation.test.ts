import { describe, it, expect } from 'vitest';
import { BoardNavigation } from './BoardNavigation';
import { Board } from './Board';
import { HexCoordinate } from './HexCoordinate';
import { Tile } from './Tile';
import { toTerrain } from './Terrain';

describe('BoardNavigation', () => {
  it('neighborEdgeTerrains maps opposite-edge terrain from each placed neighbor', () => {
    const board = new Board();
    const center = new HexCoordinate(0, 0, 0);
    const northN = new HexCoordinate(-1, 0, 1);
    board.place(new Tile({ id: 'n', south: toTerrain('water') }), northN);

    const map = BoardNavigation.neighborEdgeTerrains(board, center);

    expect(map.north?.id).toBe('water');
  });
});
