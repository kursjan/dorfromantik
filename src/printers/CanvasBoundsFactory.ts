import { BoardTile } from "../models/Board";
import { CanvasCoordinates } from "./CanvasCoordinates";
import { Point } from "./Canvas";
import { TilePrinter } from "./TilePrinter";

export interface CanvasBounds {
  readonly topLeft: Point;
  readonly bottomRight: Point;
}

export interface ICanvasBoundsFactory {
  stretch(tile: BoardTile): ICanvasBoundsFactory;
  getCanvasBounds(): CanvasBounds;
}

export class UninitializedCanvasBoundsFactory implements ICanvasBoundsFactory {
  stretch(tile: BoardTile): ICanvasBoundsFactory {
    const tileTopLeft = CanvasCoordinates.getTileCoordinates(tile.coordinate);
    const tileBottomRight = {
      x: tileTopLeft.x + TilePrinter.WIDTH - 1,
      y: tileTopLeft.y + TilePrinter.HEIGHT - 1,
    };
    const initialBounds: CanvasBounds = { topLeft: tileTopLeft, bottomRight: tileBottomRight };
    return new InitializedCanvasBoundsFactory(initialBounds);
  }

  getCanvasBounds(): CanvasBounds {
    return {
      topLeft: { x: 0, y: 0 },
      bottomRight: { x: 0, y: 0 },
    };
  }
}

export class InitializedCanvasBoundsFactory implements ICanvasBoundsFactory {
  constructor(private readonly bounds: CanvasBounds) {}

  stretch(tile: BoardTile): ICanvasBoundsFactory {
    const tileTopLeft = CanvasCoordinates.getTileCoordinates(tile.coordinate);
    const tileBottomRight = {
      x: tileTopLeft.x + TilePrinter.WIDTH - 1,
      y: tileTopLeft.y + TilePrinter.HEIGHT - 1,
    };

    const newBounds: CanvasBounds = {
      topLeft: {
        x: Math.min(this.bounds.topLeft.x, tileTopLeft.x),
        y: Math.min(this.bounds.topLeft.y, tileTopLeft.y),
      },
      bottomRight: {
        x: Math.max(this.bounds.bottomRight.x, tileBottomRight.x),
        y: Math.max(this.bounds.bottomRight.y, tileBottomRight.y),
      },
    };
    return new InitializedCanvasBoundsFactory(newBounds);
  }

  getCanvasBounds(): CanvasBounds {
    return this.bounds;
  }
}
