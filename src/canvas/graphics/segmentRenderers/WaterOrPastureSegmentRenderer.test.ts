import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getHexCorners } from '../../utils/HexUtils';
import { DEFAULT_HEX_STYLE } from '../HexStyles';
import type { WedgeDrawContext } from './WedgeDrawContext';
import { pastureSegmentRenderer } from './PastureSegmentRenderer';
import { waterSegmentRenderer } from './WaterSegmentRenderer';
import { WaterOrPastureSegmentRenderer } from './WaterOrPastureSegmentRenderer';
import {
  PastureTerrain,
  TreeTerrain,
  WaterOrPastureTerrain,
  WaterTerrain,
} from '../../../models/Terrain';

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

function minimalWedgeContext(ctx: CanvasRenderingContext2D): WedgeDrawContext {
  const size = 40;
  const corners = getHexCorners(0, 0, size);
  return {
    ctx,
    centerX: 0,
    centerY: 0,
    corners,
    segmentIndex: 0,
    startCorner: 4,
    endCorner: 5,
    style: { ...DEFAULT_HEX_STYLE, size },
    linkWaterStrokeToCenter: false,
  };
}

describe('WaterOrPastureSegmentRenderer', () => {
  let ctx: CanvasRenderingContext2D;
  let renderer: WaterOrPastureSegmentRenderer;
  let waterSpy: ReturnType<typeof vi.spyOn>;
  let pastureSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    ctx = mockCtx();
    renderer = new WaterOrPastureSegmentRenderer();
    waterSpy = vi.spyOn(waterSegmentRenderer, 'render');
    pastureSpy = vi.spyOn(pastureSegmentRenderer, 'render');
  });

  afterEach(() => {
    waterSpy.mockRestore();
    pastureSpy.mockRestore();
  });

  it('delegates to pasture when neighbor is missing', () => {
    renderer.render(minimalWedgeContext(ctx), undefined);

    expect(pastureSpy).toHaveBeenCalledTimes(1);
    expect(waterSpy).not.toHaveBeenCalled();
  });

  it('delegates to water when neighbor is water', () => {
    renderer.render(minimalWedgeContext(ctx), new WaterTerrain());

    expect(waterSpy).toHaveBeenCalledTimes(1);
    expect(pastureSpy).not.toHaveBeenCalled();
  });

  it('delegates to pasture when neighbor is pasture', () => {
    renderer.render(minimalWedgeContext(ctx), new PastureTerrain());

    expect(pastureSpy).toHaveBeenCalledTimes(1);
    expect(waterSpy).not.toHaveBeenCalled();
  });

  it('delegates to pasture when neighbor does not match water or pasture', () => {
    renderer.render(minimalWedgeContext(ctx), new TreeTerrain());

    expect(pastureSpy).toHaveBeenCalledTimes(1);
    expect(waterSpy).not.toHaveBeenCalled();
  });

  it('delegates to water when neighbor is waterOrPasture (shared match picks water first)', () => {
    renderer.render(minimalWedgeContext(ctx), new WaterOrPastureTerrain());

    expect(waterSpy).toHaveBeenCalledTimes(1);
    expect(pastureSpy).not.toHaveBeenCalled();
  });
});
