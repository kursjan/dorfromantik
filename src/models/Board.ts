import { HexCoordinate } from './HexCoordinate';
import { Tile } from './Tile';

export interface BoardTile {
  id: string; // "q,r,s"
  tile: Tile;
  coordinate: HexCoordinate;
}

export class Board {
  private tiles = new Map<string, BoardTile>();

  place(tile: Tile, coord: HexCoordinate): void {
    const id = coord.getKey();
    if (this.tiles.has(id)) {
      throw new Error(`Position ${id} is already occupied`);
    }
    const boardTile: BoardTile = {
      id,
      tile,
      coordinate: coord,
    };
    this.tiles.set(id, boardTile);
  }

  get(coord: HexCoordinate): BoardTile | undefined {
    return this.tiles.get(coord.getKey());
  }

  has(coord: HexCoordinate): boolean {
    return this.tiles.has(coord.getKey());
  }

  getAll(): BoardTile[] {
    return Array.from(this.tiles.values());
  }

  clear(): void {
    this.tiles.clear();
  }
}
