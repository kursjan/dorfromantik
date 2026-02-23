import { HexCoordinate } from './HexCoordinate';
import { Tile } from './Tile';
import type { Navigation, Direction } from './Navigation';

export interface BoardTile {
  id: string; // "q,r,s"
  tile: Tile;
  coordinate: HexCoordinate;
}

export class Board {
  private tiles = new Map<string, BoardTile>();

  /**
   * Returns a map of directions to existing neighbor tiles.
   */
  getExistingNeighbors(tile: BoardTile, navigation: Navigation): Partial<Record<Direction, BoardTile>> {
    const results: Partial<Record<Direction, BoardTile>> = {};
    for (const { direction, coordinate } of navigation.getNeighbors(tile.coordinate)) {
      const neighbor = this.get(coordinate);
      if (neighbor) {
        results[direction] = neighbor;
      }
    }
    return results;
  }

  place(tile: Tile, coord: HexCoordinate): BoardTile {
    if (!this.canPlace(coord)) {
      throw new Error(`Position ${coord.getKey()} is already occupied`);
    }
    const id = coord.getKey();
    const boardTile: BoardTile = {
      id,
      tile,
      coordinate: coord,
    };
    this.tiles.set(id, boardTile);
    return boardTile;
  }

  canPlace(coord: HexCoordinate): boolean {
    return !this.tiles.has(coord.getKey());
  }

  get(coord: HexCoordinate): BoardTile | undefined {
    return this.tiles.get(coord.getKey());
  }

  has(coord: HexCoordinate): boolean {
    return this.tiles.has(coord.getKey());
  }

  getAll(): IterableIterator<BoardTile> {
    return this.tiles.values();
  }

  clear(): void {
    this.tiles.clear();
  }
}
