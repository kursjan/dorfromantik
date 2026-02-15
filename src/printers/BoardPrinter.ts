import { Board } from '../models/Board';
import { Canvas } from './Canvas';
import { TilePrinter } from './TilePrinter';
import { CanvasCoordinates } from './CanvasCoordinates';

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
      const { x, y } = CanvasCoordinates.getTileCoordinates(boardTile.coordinate);
      
      // We need to account for the full size of the tile (WIDTH x HEIGHT)
      // The (x, y) is the top-left corner of the tile bounding box.
      minX = Math.min(minX, x);
      //maxX should cover the width of the tile
      maxX = Math.max(maxX, x + TilePrinter.WIDTH - 1); // -1 because inclusive index
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y + TilePrinter.HEIGHT - 1);
    });

    const canvas = new Canvas(minX, minY, maxX, maxY);
    const printer = new TilePrinter(canvas);

    tiles.forEach((boardTile) => {
      const { x, y } = CanvasCoordinates.getTileCoordinates(boardTile.coordinate);
      printer.print(boardTile.tile, x, y);
    });

    const output = canvas.toString();
    console.log(output);
    return output;
  }
}
