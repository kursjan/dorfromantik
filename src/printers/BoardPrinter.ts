import { Board } from '../models/Board';
import { Canvas } from './Canvas';
import { TilePrinter } from './TilePrinter';

export class BoardPrinter {
  
  print(board: Board): string {
    const tiles = board.getAll();
    if (tiles.length === 0) {
      return '';
    }

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    tiles.forEach((boardTile) => {
      const { q, r } = boardTile.coordinate;
      const cx = 7 * q;
      const cy = 2 * q + 4 * r;
      minX = Math.min(minX, cx);
      maxX = Math.max(maxX, cx + 8);
      minY = Math.min(minY, cy);
      maxY = Math.max(maxY, cy + 4);
    });

    const canvas = new Canvas(minX, minY, maxX, maxY);
    const printer = new TilePrinter(canvas);

    tiles.forEach((boardTile) => {
      const { q, r } = boardTile.coordinate;
      const tile = boardTile.tile;

      const cx = 7 * q;
      const cy = 2 * q + 4 * r;

      printer.print(tile, cx, cy);
    });

    const output = canvas.toString();
    console.log(output);
    return output;
  }
}
