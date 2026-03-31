import { HexCoordinate } from './HexCoordinate';
import { Tile } from './Tile';
import { getNeighbors, type Direction } from './Navigation';
import { isValidPlacement } from './PlacementValidator';

export interface BoardTile {
  readonly id: string; // "q,r,s"
  readonly tile: Tile;
  readonly coordinate: HexCoordinate;
}

/**
 * An immutable representation of the hexagonal board.
 */
export class Board {
  private readonly tiles: ReadonlyMap<string, BoardTile>;

  /**
   * Creates a new instance of the Board.
   * @param tiles - An optional map of initial tiles to populate the board.
   */
  constructor(tiles?: Map<string, BoardTile> | ReadonlyMap<string, BoardTile>) {
    this.tiles = tiles ? new Map(tiles) : new Map();
  }

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

  getExistingNeighbors(tile: BoardTile): Partial<Record<Direction, BoardTile>> {
    return this.getExistingNeighborsAt(tile.coordinate);
  }

  getValidPlacementCoordinates(tile: Tile): HexCoordinate[] {
    const uniqueCoords = new Map<string, HexCoordinate>();
    for (const coord of this.getAllValidNeighbors(tile)) {
      uniqueCoords.set(coord.getKey(), coord);
    }
    return Array.from(uniqueCoords.values());
  }

  /**
   * Returns a new Board instance with the given tile placed at the specified coordinate.
   * @param tile - The tile to place.
   * @param coord - The coordinate where the tile should be placed.
   * @returns An object containing the new Board instance and the newly created BoardTile.
   * @throws Error if the position is already occupied.
   */
  place(tile: Tile, coord: HexCoordinate): { board: Board; placedTile: BoardTile } {
    if (!this.canPlace(coord)) {
      throw new Error(`Position ${coord.getKey()} is already occupied`);
    }
    const id = coord.getKey();
    const boardTile: BoardTile = {
      id,
      tile,
      coordinate: coord,
    };

    const newTiles = new Map(this.tiles);
    newTiles.set(id, boardTile);

    return {
      board: new Board(newTiles),
      placedTile: boardTile,
    };
  }

  /**
   * Fluent convenience for immutable board transitions when only the next Board is needed.
   */
  withTile(tile: Tile, coord: HexCoordinate): Board {
    return this.place(tile, coord).board;
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

  clear(): Board {
    return new Board();
  }

  private getAllValidNeighbors(tile: Tile): HexCoordinate[] {
    const allCoords: HexCoordinate[] = [];
    for (const boardTile of this.tiles.values()) {
      allCoords.push(...this.getValidNeighborsOf(boardTile, tile));
    }
    return allCoords;
  }

  private getValidNeighborsOf(boardTile: BoardTile, tile: Tile): HexCoordinate[] {
    const results: HexCoordinate[] = [];
    for (const { coordinate: neighborCoord } of getNeighbors(boardTile.coordinate)) {
      if (isValidPlacement(this, neighborCoord, tile)) {
        results.push(neighborCoord);
      }
    }
    return results;
  }
}
