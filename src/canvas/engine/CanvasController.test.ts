import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CanvasController } from './CanvasController';
import { HexRenderer } from '../graphics/HexRenderer';
import { DebugRenderer } from '../graphics/DebugRenderer';
import { BackgroundRenderer } from '../graphics/BackgroundRenderer';
import { InputManager } from './InputManager';

// Mock dependencies
vi.mock('../graphics/HexRenderer');
vi.mock('../graphics/DebugRenderer');
vi.mock('../graphics/BackgroundRenderer');
vi.mock('./InputManager');
vi.mock('./Camera', () => {
  const Camera = vi.fn();
  Camera.prototype.applyTransform = vi.fn();
  Camera.prototype.screenToWorld = vi.fn(coords => coords);
  Camera.prototype.pan = vi.fn();
  Camera.prototype.zoomBy = vi.fn();
  Camera.prototype.rotateBy = vi.fn(); // Added rotateBy
  Camera.prototype.x = 0;
  Camera.prototype.y = 0;
  Camera.prototype.zoom = 1;
  Camera.prototype.rotation = 0;
  return { Camera };
});

describe('CanvasController', () => {
  let canvas: HTMLCanvasElement;
  let controller: CanvasController;

  beforeEach(() => {
    // Set up a basic DOM environment for the canvas element
    const canvasElement = document.createElement('canvas');
    canvasElement.getContext = vi.fn().mockReturnValue({
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      rotate: vi.fn(), // Added rotate
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      fillText: vi.fn(),
    }) as any;
    document.body.appendChild(canvasElement);
    canvas = canvasElement;

    vi.clearAllMocks();
  });

  it('should initialize successfully', () => {
    controller = new CanvasController(canvas);
    expect((controller as any).ctx).toBeDefined();
    expect((controller as any).renderer).toBeInstanceOf(HexRenderer);
    expect((controller as any).debugRenderer).toBeInstanceOf(DebugRenderer);
    expect((controller as any).backgroundRenderer).toBeInstanceOf(BackgroundRenderer);
    expect((controller as any).inputManager).toBeInstanceOf(InputManager);
  });

  it('should start the render loop on construction', () => {
    const requestAnimationFrameSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => {
      // a more robust mock that doesn't cause an infinite loop
      return 0;
    });
    
    controller = new CanvasController(canvas);

    expect(requestAnimationFrameSpy).toHaveBeenCalled();
    const renderer = (controller as any).renderer as any;
    const debugRenderer = (controller as any).debugRenderer as any;
    expect(renderer.drawDebugGrid).toHaveBeenCalled();
    expect(debugRenderer.drawOverlay).toHaveBeenCalled();

    requestAnimationFrameSpy.mockRestore();
  });

  it('should clean up all resources on destroy', () => {
    // Spies for all cleanup actions
    const cancelAnimationFrameSpy = vi.spyOn(window, 'cancelAnimationFrame');
    
    controller = new CanvasController(canvas);
    const inputManager = (controller as any).inputManager as any;
    
    // We need to ensure inputManager.destroy is a spy
    // Since we mocked InputManager constructor, instances are auto-mocked,
    // so .destroy should already be a spy-like mock function if vitest auto-mocking works standardly.
    // But to be safe, let's explicitly mock it on the instance.
    inputManager.destroy = vi.fn();

    // Call destroy
    controller.destroy();

    // Assert all cleanup actions were called
    expect(cancelAnimationFrameSpy).toHaveBeenCalled();
    expect(inputManager.destroy).toHaveBeenCalled();
  });
});
