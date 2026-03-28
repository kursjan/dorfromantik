import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getHexCorners } from '../../utils/HexUtils';
import { DEFAULT_HEX_STYLE } from '../HexStyles';
import type { WedgeDrawContext } from './WedgeDrawContext';
import { WaterSegmentRenderer } from './WaterSegmentRenderer';

function mockCtx(): CanvasRenderingContext2D {
  return {
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
  } as unknown as CanvasRenderingContext2D;
}

function wedgeContext(
  ctx: CanvasRenderingContext2D,
  segmentIndex: number,
  linkWaterStrokeToCenter: boolean
): WedgeDrawContext {
  const size = 40;
  const corners = getHexCorners(0, 0, size);
  const i = segmentIndex;
  return {
    ctx,
    centerX: 0,
    centerY: 0,
    corners,
    segmentIndex: i,
    startCorner: (i + 4) % 6,
    endCorner: (i + 5) % 6,
    style: { ...DEFAULT_HEX_STYLE, size },
    linkWaterStrokeToCenter,
  };
}

describe('WaterSegmentRenderer', () => {
  let ctx: CanvasRenderingContext2D;
  let renderer: WaterSegmentRenderer;

  beforeEach(() => {
    ctx = mockCtx();
    renderer = new WaterSegmentRenderer();
  });

  it('fills wedge and draws one curved water stroke', () => {
    renderer.render(wedgeContext(ctx, 0, true), undefined);

    expect(ctx.fill).toHaveBeenCalledTimes(1);
    expect(ctx.quadraticCurveTo).toHaveBeenCalledTimes(1);
    expect(ctx.stroke).toHaveBeenCalledTimes(1);
  });

  it('links stroke to tile center when linkWaterStrokeToCenter is true', () => {
    renderer.render(wedgeContext(ctx, 0, true), undefined);

    const curveCalls = (ctx.quadraticCurveTo as ReturnType<typeof vi.fn>).mock.calls;
    const endpoints = curveCalls.map(([, , x, y]) => [x, y]);
    const endsAtCenter = endpoints.some(([x, y]) => Math.abs(x) < 0.001 && Math.abs(y) < 0.001);
    expect(endsAtCenter).toBe(true);
  });

  it('links stroke to midpoint between edge and center when linkWaterStrokeToCenter is false', () => {
    renderer.render(wedgeContext(ctx, 1, false), undefined);

    const curveCalls = (ctx.quadraticCurveTo as ReturnType<typeof vi.fn>).mock.calls;
    const endpoints = curveCalls.map(([, , x, y]) => [x, y]);
    const hasMidpointEndpoint = endpoints.some(
      ([x, y]) => Math.abs(x - 15) < 0.01 && Math.abs(y + 8.6603) < 0.01
    );
    expect(hasMidpointEndpoint).toBe(true);
  });
});
