import { Tile, TerrainType } from '../models/Tile';
import { Canvas } from './Canvas';

/**
 * Prints a single tile to a canvas.
 * 
 * Visual representation of a tile (9x5 characters):
 * 
 *   012345678
 * 0    _ _
 * 1  /  N  \
 * 2 /W     E\
 * 3 \w     e/
 * 4  \ _S_ /
 * 
 * Legend:
 * N: North terrain
 * E: North-East terrain
 * e: South-East terrain
 * S: South terrain
 * w: South-West terrain
 * W: North-West terrain
 */
export class TilePrinter {
  static readonly WIDTH = 9;
  static readonly HEIGHT = 5;
  private canvas: Canvas;

  constructor(canvas: Canvas) {
    this.canvas = canvas;
  }

  print(tile: Tile, topLeftX: number, topLeftY: number): void {
    const getTerrainChar = (type: TerrainType): string => {
      return type[0].toUpperCase();
    };

    const draw = (dx: number, dy: number, char: string) => {
      this.canvas.set(topLeftX + dx, topLeftY + dy, char);
    };

    const t = tile;

    // Row 0
    draw(3, 0, '_');
    draw(5, 0, '_');

    // Row 1
    draw(1, 1, '/');
    draw(4, 1, getTerrainChar(t.north));
    draw(7, 1, '\\');

    // Row 2
    draw(0, 2, '/');
    draw(1, 2, getTerrainChar(t.northWest));
    draw(7, 2, getTerrainChar(t.northEast));
    draw(8, 2, '\\');

    // Row 3
    draw(0, 3, '\\');
    draw(1, 3, getTerrainChar(t.southWest));
    draw(7, 3, getTerrainChar(t.southEast));
    draw(8, 3, '/');

    // Row 4
    draw(1, 4, '\\');
    draw(3, 4, '_');
    draw(4, 4, getTerrainChar(t.south));
    draw(5, 4, '_');
    draw(7, 4, '/');
  }
}
