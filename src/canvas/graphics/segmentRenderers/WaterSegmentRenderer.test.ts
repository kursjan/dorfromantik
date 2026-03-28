import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getHexCorners } from '../../utils/HexUtils';
import { DEFAULT_HEX_STYLE } from '../HexStyles';
import type { WedgeDrawContext } from './WedgeDrawContext';
import { WaterSegmentRenderer } from './WaterSegmentRenderer';
import { WaterOrPastureTerrain, WaterTerrain } from '../../../models/Terrain';

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

function wedgeContext(ctx: CanvasRenderingContext2D, segmentIndex: number): WedgeDrawContext {
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
    renderer.render(wedgeContext(ctx, 0), undefined, new WaterTerrain({ linkToCenter: true }));

    expect(ctx.fill).toHaveBeenCalledTimes(1);
    expect(ctx.quadraticCurveTo).toHaveBeenCalledTimes(1);
    expect(ctx.stroke).toHaveBeenCalledTimes(1);
  });

  it('links stroke to tile center when water terrain has linkToCenter true', () => {
    renderer.render(wedgeContext(ctx, 0), undefined, new WaterTerrain({ linkToCenter: true }));

    const curveCalls = (ctx.quadraticCurveTo as ReturnType<typeof vi.fn>).mock.calls;
    const endpoints = curveCalls.map(([, , x, y]) => [x, y]);
    const endsAtCenter = endpoints.some(([x, y]) => Math.abs(x) < 0.001 && Math.abs(y) < 0.001);
    expect(endsAtCenter).toBe(true);
  });

  it('links stroke to midpoint when water terrain has linkToCenter false', () => {
    renderer.render(wedgeContext(ctx, 1), undefined, new WaterTerrain({ linkToCenter: false }));

    const curveCalls = (ctx.quadraticCurveTo as ReturnType<typeof vi.fn>).mock.calls;
    const endpoints = curveCalls.map(([, , x, y]) => [x, y]);
    const hasMidpointEndpoint = endpoints.some(
      ([x, y]) => Math.abs(x - 15) < 0.01 && Math.abs(y + 8.6603) < 0.01
    );
    expect(hasMidpointEndpoint).toBe(true);
  });

  it('honors linkToCenter when segment terrain is WaterOrPastureTerrain', () => {
    renderer.render(
      wedgeContext(ctx, 0),
      undefined,
      new WaterOrPastureTerrain({ linkToCenter: true })
    );

    const curveCalls = (ctx.quadraticCurveTo as ReturnType<typeof vi.fn>).mock.calls;
    const endpoints = curveCalls.map(([, , x, y]) => [x, y]);
    const endsAtCenter = endpoints.some(([x, y]) => Math.abs(x) < 0.001 && Math.abs(y) < 0.001);
    expect(endsAtCenter).toBe(true);
  });
});
