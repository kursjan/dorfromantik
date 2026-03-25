import { Tile } from '../../models/Tile';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HexCoordinate } from '../../models/HexCoordinate';
import { BackgroundRenderer } from '../graphics/BackgroundRenderer';
import { HexRenderer } from '../graphics/HexRenderer';
import { TileRenderer } from '../graphics/TileRenderer';
import { CanvasController } from './CanvasController';
import { InputManager } from './InputManager';
import { Game } from '../../models/Game';
import { GameRules } from '../../models/GameRules';
import { pixelToHex } from '../utils/HexUtils';

// Mock dependencies
vi.mock('../utils/HexUtils');
vi.mock('../graphics/HexRenderer');
vi.mock('../graphics/TileRenderer');
vi.mock('../graphics/DebugRenderer');
vi.mock('../graphics/BackgroundRenderer');
vi.mock('./InputManager');
vi.mock('./Camera', () => {
  const Camera = vi.fn();
  Camera.prototype.applyTransform = vi.fn();
  Camera.prototype.screenToWorld = vi.fn((coords) => coords);
  Camera.prototype.pan = vi.fn();
  Camera.prototype.zoomBy = vi.fn();
  Camera.prototype.rotateBy = vi.fn();
  Camera.prototype.reset = vi.fn();
  Camera.prototype.x = 0;
  Camera.prototype.y = 0;
  Camera.prototype.zoom = 1;
  Camera.prototype.rotation = 0;
  return { Camera };
});

describe('CanvasController', () => {
  let canvas: HTMLCanvasElement;
  let controller: CanvasController;
  let activeGame: Game;

  beforeEach(() => {
    // Set up a basic DOM environment for the canvas element
    const canvasElement = document.createElement('canvas');
    canvasElement.getContext = vi.fn().mockReturnValue({
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      rotate: vi.fn(),
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      fillText: vi.fn(),
    }) as any;
    document.body.appendChild(canvasElement);
    canvas = canvasElement;

    // Create a minimal active game
    activeGame = Game.create(GameRules.createTest());

    vi.clearAllMocks();
  });

  it('should initialize successfully', () => {
    controller = new CanvasController(canvas, activeGame);
    expect((controller as any).ctx).toBeDefined();
    expect((controller as any).renderer).toBeInstanceOf(HexRenderer);
    expect((controller as any).tileRenderer).toBeInstanceOf(TileRenderer);
    // expect((controller as any).debugRenderer).toBeInstanceOf(DebugRenderer);
    expect((controller as any).backgroundRenderer).toBeInstanceOf(BackgroundRenderer);
    expect((controller as any).inputManager).toBeInstanceOf(InputManager);
  });

  it('should start the render loop on construction', () => {
    const requestAnimationFrameSpy = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation(() => 0);

    controller = new CanvasController(canvas, activeGame);

    expect(requestAnimationFrameSpy).toHaveBeenCalled();
    const renderer = (controller as any).renderer as any;
    expect(renderer.drawDebugGrid).toHaveBeenCalled();
    // Debug overlay is now handled by React
    // expect(debugRenderer.drawOverlay).toHaveBeenCalled();

    requestAnimationFrameSpy.mockRestore();
  });

  it('should render tiles from the board', () => {
    const tile = new Tile({ id: 't1' });
    const coord = new HexCoordinate(-1, 0, 1);
    activeGame.board.place(tile, coord);

    controller = new CanvasController(canvas, activeGame);
    const tileRenderer = (controller as any).tileRenderer as any;

    // Manually trigger a render
    (controller as any).render();

    expect(tileRenderer.drawTileAtHex).toHaveBeenCalledWith(
      tile,
      coord,
      expect.any(Object)
    );
  });

  it('should clean up all resources on destroy', () => {
    const cancelAnimationFrameSpy = vi.spyOn(window, 'cancelAnimationFrame');

    controller = new CanvasController(canvas, activeGame);
    const inputManager = (controller as any).inputManager as any;
    inputManager.destroy = vi.fn();

    controller.destroy();

    expect(cancelAnimationFrameSpy).toHaveBeenCalled();
    expect(inputManager.destroy).toHaveBeenCalled();
  });

  it('should notify debug stats change and respect throttling', () => {
    vi.useFakeTimers();

    controller = new CanvasController(canvas, activeGame);
    const callback = vi.fn();
    controller.subscribeDebug(callback);

    // Advance time to ensure now - lastDebugUpdateTime > 500
    vi.advanceTimersByTime(1000);

    // First render - should notify
    (controller as any).render();
    expect(callback).toHaveBeenCalledTimes(1);
    expect(controller.getDebugSnapshot()).toEqual(
      expect.objectContaining({
        fps: expect.any(Number),
        camera: expect.objectContaining({
          x: expect.any(Number),
          y: expect.any(Number),
          zoom: expect.any(Number),
        }),
        hoveredHex: null,
      })
    );

    callback.mockClear();

    // Render again immediately - should be throttled
    (controller as any).render();
    expect(callback).not.toHaveBeenCalled();

    // Advance time by 501ms
    vi.advanceTimersByTime(501);
    (controller as any).render();
    expect(callback).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });

  it('should handle camera reset', () => {
    controller = new CanvasController(canvas, activeGame);
    const camera = (controller as any).camera;
    controller.resetCamera();
    expect(camera.reset).toHaveBeenCalled();
  });

  it('should allow removing debug stats listener', () => {
    controller = new CanvasController(canvas, activeGame);
    const callback = vi.fn();
    const removeListener = controller.subscribeDebug(callback);
    
    expect((controller as any).debugListeners.has(callback)).toBe(true);
    removeListener();
    expect((controller as any).debugListeners.has(callback)).toBe(false);
  });

  it('should throw error in render if active game is missing', () => {
    controller = new CanvasController(canvas, activeGame);
    (controller as any).activeGame = undefined;
    expect(() => (controller as any).render()).toThrow('No active game found in session');
  });

  it('should render ghost preview when hovering over a hex', () => {
    controller = new CanvasController(canvas, activeGame);
    (controller as any).hoveredHex = new HexCoordinate(1, 0, -1);
    
    const tileRenderer = (controller as any).tileRenderer as any;
    (controller as any).render();

    expect(tileRenderer.drawTileAtHex).toHaveBeenCalledWith(
      expect.any(Tile),
      (controller as any).hoveredHex,
      expect.any(Object)
    );
  });

  it('should update camera rotation based on input manager continuous rotation', () => {
    controller = new CanvasController(canvas, activeGame);
    const inputManager = (controller as any).inputManager as any;
    const camera = (controller as any).camera;
    
    // Simulate continuous rotation input (clockwise)
    inputManager.getRotationDirection.mockReturnValue(1);
    
    (controller as any).update();
    
    expect(camera.rotateBy).toHaveBeenCalledWith(0.05);
  });

  it('should cover input manager callbacks', () => {
    let capturedCallbacks: any;
    
    // We need to temporarily override the mock for this specific test
    const OriginalInputManager = vi.mocked(InputManager);
    OriginalInputManager.mockImplementation(function (this: any, _canvas: any, callbacks: any) {
      capturedCallbacks = callbacks;
      this.destroy = vi.fn();
      this.getRotationDirection = vi.fn().mockReturnValue(0);
      return this;
    } as any);

    controller = new CanvasController(canvas, activeGame);
    const camera = (controller as any).camera;
    const zoomSpy = vi.spyOn(controller as any, 'handleZoom');
    const hoverSpy = vi.spyOn(controller as any, 'handleHover');
    const clickSpy = vi.spyOn(controller as any, 'handleMouseClick');
    const rotateCWSpy = vi.spyOn(controller as any, 'handleRotateClockwise');
    const rotateCCWSpy = vi.spyOn(controller as any, 'handleRotateCounterClockwise');
    const leaveSpy = vi.spyOn(controller as any, 'handleLeave');

    capturedCallbacks.onPan(10, 20);
    expect(camera.pan).toHaveBeenCalledWith(10, 20);

    capturedCallbacks.onZoom(100);
    expect(zoomSpy).toHaveBeenCalledWith(100);

    vi.mocked(pixelToHex).mockReturnValue(new HexCoordinate(0, 0, 0));

    capturedCallbacks.onHover(50, 50);
    expect(hoverSpy).toHaveBeenCalledWith(50, 50);

    capturedCallbacks.onClick(50, 50);
    expect(clickSpy).toHaveBeenCalledWith(50, 50);

    capturedCallbacks.onRotateClockwise();
    expect(rotateCWSpy).toHaveBeenCalled();

    capturedCallbacks.onRotateCounterClockwise();
    expect(rotateCCWSpy).toHaveBeenCalled();

    capturedCallbacks.onLeave();
    expect(leaveSpy).toHaveBeenCalled();
    
    // Resize test
    capturedCallbacks.onResize();
    expect(canvas.width).toBe(window.innerWidth);

    // Restore the default mock behavior
    OriginalInputManager.mockImplementation(function (this: any) {
      this.destroy = vi.fn();
      this.getRotationDirection = vi.fn().mockReturnValue(0);
      return this;
    } as any);
  });

  describe('Input Handlers', () => {
    beforeEach(() => {
      controller = new CanvasController(canvas, activeGame);
    });

    it('should handle zoom and respect sensitivity bounds', () => {
      const camera = (controller as any).camera;
      const zoomBySpy = vi.spyOn(camera, 'zoomBy');
      
      (controller as any).handleZoom(100);
      
      // ZOOM_SENSITIVITY is 0.001, MIN_ZOOM is 0.5, MAX_ZOOM is 3.0
      expect(zoomBySpy).toHaveBeenCalledWith(
        -0.1, // -100 * 0.001
        0.5,
        3.0
      );
    });

    it('should handle hover and update hoveredHex', () => {
      // Mock screenToWorld to return predictable coords
      const camera = (controller as any).camera;
      // Depending on HexSize, 0,0 is hex 0,0,0
      camera.screenToWorld = vi.fn().mockReturnValue({ x: 0, y: 0 });
      vi.mocked(pixelToHex).mockReturnValue(new HexCoordinate(0, 0, 0));
      
      (controller as any).handleHover(100, 100);
      
      // Based on pixelToHex(0, 0)
      expect((controller as any).hoveredHex).toEqual(new HexCoordinate(0, 0, 0));
    });

    it('should handle leave and clear hoveredHex', () => {
      (controller as any).hoveredHex = new HexCoordinate(0, 0, 0);
      
      (controller as any).handleLeave();
      
      expect((controller as any).hoveredHex).toBeNull();
    });

    it('should handle rotate clockwise and notify stats change', () => {
      const rotateSpy = vi.spyOn(activeGame, 'rotateQueuedTileClockwise');
      const notifySpy = vi.fn();
      controller.onStatsChange = notifySpy;

      (controller as any).handleRotateClockwise();

      expect(rotateSpy).toHaveBeenCalled();
      expect(notifySpy).toHaveBeenCalledWith(
        activeGame.score,
        activeGame.remainingTurns,
        activeGame.peek()
      );
    });

    it('should handle rotate counter-clockwise and notify stats change', () => {
      const rotateSpy = vi.spyOn(activeGame, 'rotateQueuedTileCounterClockwise');
      const notifySpy = vi.fn();
      controller.onStatsChange = notifySpy;

      (controller as any).handleRotateCounterClockwise();

      expect(rotateSpy).toHaveBeenCalled();
      expect(notifySpy).toHaveBeenCalledWith(
        activeGame.score,
        activeGame.remainingTurns,
        activeGame.peek()
      );
    });

    it('should handle mouse click and place tile if placement is valid', () => {
      const placeTileSpy = vi.spyOn(activeGame, 'placeTile');
      const notifySpy = vi.fn();
      controller.onStatsChange = notifySpy;

      // Coordinate (1, 0, -1) is adjacent to (0, 0, 0) and likely empty initially
      const targetCoord = new HexCoordinate(1, 0, -1);

      const camera = (controller as any).camera;
      camera.screenToWorld = vi.fn().mockReturnValue({ x: 100, y: 100 });
      
      // We need to mock pixelToHex to return our targetCoord
      vi.mocked(pixelToHex).mockReturnValue(targetCoord);
      
      // Mock isValidPlacement to return true
      vi.spyOn(activeGame, 'isValidPlacement').mockReturnValue(true);

      (controller as any).handleMouseClick(100, 100);

      expect(placeTileSpy).toHaveBeenCalledWith(targetCoord);
      expect(notifySpy).toHaveBeenCalled();
    });

    it('should not place tile on mouse click if placement is invalid', () => {
      const placeTileSpy = vi.spyOn(activeGame, 'placeTile');
      const notifySpy = vi.fn();
      controller.onStatsChange = notifySpy;

      const targetCoord = new HexCoordinate(0, 0, 0); // Occupied
      const camera = (controller as any).camera;
      camera.screenToWorld = vi.fn().mockReturnValue({ x: 0, y: 0 });
      vi.mocked(pixelToHex).mockReturnValue(targetCoord);
      
      // Mock isValidPlacement to return false
      vi.spyOn(activeGame, 'isValidPlacement').mockReturnValue(false);

      (controller as any).handleMouseClick(0, 0);

      expect(placeTileSpy).not.toHaveBeenCalled();
      expect(notifySpy).not.toHaveBeenCalled();
    });
  });
});
