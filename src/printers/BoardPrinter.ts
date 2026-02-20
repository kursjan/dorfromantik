import { Board } from '../models/Board';
import { Canvas } from './Canvas';
import { TilePrinter } from './TilePrinter';
import { CanvasCoordinates } from './CanvasCoordinates';
import { UninitializedCanvasBoundsFactory, ICanvasBoundsFactory } from './CanvasBoundsFactory';

export class BoardPrinter {
  print(board: Board): string {
    let boundsFactory: ICanvasBoundsFactory = new UninitializedCanvasBoundsFactory();

    // First pass: Iterate through all tiles to calculate the final canvas bounds.
    for (const boardTile of board.getAll()) {
      boundsFactory = boundsFactory.stretch(boardTile);
    }

    const canvas = new Canvas(boundsFactory.getCanvasBounds());
    const printer = new TilePrinter(canvas);

    // Second pass: Iterate again to print the tiles onto the canvas.
    for (const boardTile of board.getAll()) {
      const { x, y } = CanvasCoordinates.getTileCoordinates(boardTile.coordinate);
      printer.print(boardTile.tile, x, y);
    }

    const output = canvas.toString();
    console.log(output);
    return output;
  }
}
