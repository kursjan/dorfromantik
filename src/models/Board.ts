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
