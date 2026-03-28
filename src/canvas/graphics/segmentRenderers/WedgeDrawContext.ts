import type { Terrain } from '../../../models/Terrain';
import type { HexStyle } from '../HexStyles';

export interface WedgeDrawContext {
  ctx: CanvasRenderingContext2D;
  centerX: number;
  centerY: number;
  corners: { x: number; y: number }[];
  /** Index of this wedge / direction (0–5). */
  segmentIndex: number;
  startCorner: number;
  endCorner: number;
  style: HexStyle;
  /** For water / waterOrPasture edges: river stroke targets tile center vs edge midpoint. */
  linkWaterStrokeToCenter: boolean;
}

export function fillHexWedge(context: WedgeDrawContext, fillColor: string): void {
  const { ctx, centerX, centerY, corners, startCorner, endCorner } = context;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(corners[startCorner].x, corners[startCorner].y);
  ctx.lineTo(corners[endCorner].x, corners[endCorner].y);
  ctx.closePath();
  ctx.fillStyle = fillColor;
  ctx.fill();
}

/** One renderer per terrain id; `neighborAcrossEdge` is the opposite edge on the adjacent hex. */
export interface TerrainSegmentRenderer {
  render(context: WedgeDrawContext, neighborAcrossEdge: Terrain | undefined): void;
}
