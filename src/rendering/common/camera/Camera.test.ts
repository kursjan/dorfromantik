import { describe, it, expect, beforeEach } from 'vitest';
import { ClientDelta } from '../ClientPoint';
import { ContainerDelta, ContainerPoint } from '../ContainerPoint';
import { WORLD_ORIGIN } from '../WorldPoint';
import { Camera } from './Camera';

describe('Camera', () => {
  let camera: Camera;

  beforeEach(() => {
    camera = new Camera({ position: WORLD_ORIGIN, zoom: 1 });
  });

  it('initializes with default values', () => {
    expect(camera.pan.x).toBe(0);
    expect(camera.pan.y).toBe(0);
    expect(camera.zoom).toBe(1);
  });

  it('pans the camera correctly', () => {
    camera.panBy(ContainerDelta.fromClientDelta(ClientDelta.xy(10, 20)));
    expect(camera.pan.x).toBe(10);
    expect(camera.pan.y).toBe(20);
  });

  it('zooms the camera within limits', () => {
    camera.zoomBy(0.5, 0.5, 3.0);
    expect(camera.zoom).toBe(1.5);

    camera.zoomBy(2.0, 0.5, 3.0);
    expect(camera.zoom).toBe(3.0); // Max cap

    camera.zoomBy(-5.0, 0.5, 3.0);
    expect(camera.zoom).toBe(0.5); // Min cap
  });

  it('converts container coordinates to world coordinates', () => {
    // Center of 800×600 viewport (container-local pixels)
    const result = camera.containerToWorld(ContainerPoint.xy(400, 300), 800, 600);
    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
  });
});
