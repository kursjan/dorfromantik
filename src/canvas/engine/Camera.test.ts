import { describe, it, expect, beforeEach } from 'vitest';
import { Camera } from './Camera';

describe('Camera', () => {
  let camera: Camera;

  beforeEach(() => {
    camera = new Camera({ x: 0, y: 0, zoom: 1 });
  });

  it('initializes with default values', () => {
    expect(camera.x).toBe(0);
    expect(camera.y).toBe(0);
    expect(camera.zoom).toBe(1);
  });

  it('pans the camera correctly', () => {
    camera.pan(10, 20);
    expect(camera.x).toBe(10);
    expect(camera.y).toBe(20);
  });

  it('zooms the camera within limits', () => {
    camera.zoomBy(0.5, 0.5, 3.0);
    expect(camera.zoom).toBe(1.5);
    
    camera.zoomBy(2.0, 0.5, 3.0);
    expect(camera.zoom).toBe(3.0); // Max cap
    
    camera.zoomBy(-5.0, 0.5, 3.0);
    expect(camera.zoom).toBe(0.5); // Min cap
  });

  it('converts screen coordinates to world coordinates', () => {
    // Center of 800x600 canvas
    const result = camera.screenToWorld(400, 300, 800, 600);
    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
  });
});
