import { BACKGROUND_COLOR } from './BackgroundStyles';

export class BackgroundRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public draw(width: number, height: number) {
    this.ctx.fillStyle = BACKGROUND_COLOR;
    this.ctx.fillRect(0, 0, width, height);
  }
}
