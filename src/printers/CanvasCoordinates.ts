import { HexCoordinate } from '../models/HexCoordinate';
import { TilePrinter } from './TilePrinter';

export class CanvasCoordinates {
  static getTileCoordinates(coord: HexCoordinate): { x: number; y: number } {
    const { q, r } = coord;
    // q increases South (visually y increases by HEIGHT - 1)
    // r increases South-East (visually x increases by WIDTH - 2, y increases by (HEIGHT - 1) / 2)
    const verticalStep = TilePrinter.HEIGHT - 1;
    const horizontalStep = TilePrinter.WIDTH - 2;
    const diagonalYStep = verticalStep / 2;

    const x = horizontalStep * r;
    const y = verticalStep * q + diagonalYStep * r;
    return { x, y };
  }
}
