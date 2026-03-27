import { HexCoordinate } from './HexCoordinate';
import { Tile } from './Tile';
import { getNeighbors, type Direction } from './Navigation';
import { isValidPlacement } from './PlacementValidator';

export interface BoardTile {
  id: string; // "q,r,s"
  tile: Tile;
  coordinate: HexCoordinate;
}

export class Board {
  private tiles = new Map<string, BoardTile>();

  /**
   * Returns a map of directions to existing neighbor tiles from a given coordinate.
   */
  getExistingNeighborsAt(coord: HexCoordinate): Partial<Record<Direction, BoardTile>> {
    const results: Partial<Record<Direction, BoardTile>> = {};
    for (const { direction, coordinate } of getNeighbors(coord)) {
      const neighbor = this.get(coordinate);
      if (neighbor) {
        results[direction] = neighbor;
      }
    }
    return results;
  }

  /**
   * Returns a map of directions to existing neighbor tiles.
   */
  getExistingNeighbors(tile: BoardTile): Partial<Record<Direction, BoardTile>> {
    return this.getExistingNeighborsAt(tile.coordinate);
  }

  getValidPlacementCoordinates(): HexCoordinate[] {
    const uniqueCoords = new Map<string, HexCoordinate>();

    for (const tile of this.tiles.values()) {
      for (const coord of this.getValidNeighborsOf(tile)) {
        uniqueCoords.set(coord.getKey(), coord);
      }
    }

    return Array.from(uniqueCoords.values());
  }

  private getValidNeighborsOf(boardTile: BoardTile): HexCoordinate[] {
    const results: HexCoordinate[] = [];
    for (const { coordinate: neighborCoord } of getNeighbors(boardTile.coordinate)) {
      if (isValidPlacement(this, neighborCoord)) {
        results.push(neighborCoord);
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
