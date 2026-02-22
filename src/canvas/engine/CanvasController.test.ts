import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CanvasController } from './CanvasController';
import { HexRenderer } from '../graphics/HexRenderer';
import { TileRenderer } from '../graphics/TileRenderer';
import { DebugRenderer } from '../graphics/DebugRenderer';
import { BackgroundRenderer } from '../graphics/BackgroundRenderer';
import { InputManager } from './InputManager';
import { Session } from '../../models/Session';
import { User } from '../../models/User';
import { Board } from '../../models/Board';
import { Tile } from '../../models/Tile';
import { HexCoordinate } from '../../models/HexCoordinate';

// Mock dependencies
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
  let session: Session;

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

    // Create a minimal session with an active game
    const user = new User('user-1', 'Test User');
    const board = new Board();
    session = new Session('session-1', user);
    session.activeGame = {
      board,
      score: 0,
      remainingTurns: 30,
    } as any;

    vi.clearAllMocks();
  });

  it('should initialize successfully', () => {
    controller = new CanvasController(canvas, session);
    expect((controller as any).ctx).toBeDefined();
    expect((controller as any).renderer).toBeInstanceOf(HexRenderer);
    expect((controller as any).tileRenderer).toBeInstanceOf(TileRenderer);
    expect((controller as any).debugRenderer).toBeInstanceOf(DebugRenderer);
    expect((controller as any).backgroundRenderer).toBeInstanceOf(BackgroundRenderer);
    expect((controller as any).inputManager).toBeInstanceOf(InputManager);
  });

  it('should start the render loop on construction', () => {
    const requestAnimationFrameSpy = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation(() => 0);

    controller = new CanvasController(canvas, session);

    expect(requestAnimationFrameSpy).toHaveBeenCalled();
    const renderer = (controller as any).renderer as any;
    const debugRenderer = (controller as any).debugRenderer as any;
    expect(renderer.drawDebugGrid).toHaveBeenCalled();
    expect(debugRenderer.drawOverlay).toHaveBeenCalled();

    requestAnimationFrameSpy.mockRestore();
  });

  it('should render tiles from the board', () => {
    const tile = Tile.createRandom('t1');
    const coord = new HexCoordinate(0, 0, 0);
    session.activeGame!.board.place(tile, coord);

    controller = new CanvasController(canvas, session);
    const tileRenderer = (controller as any).tileRenderer as any;

    // Manually trigger a render
    (controller as any).render();

    expect(tileRenderer.drawTileAtHex).toHaveBeenCalledWith(
      tile,
      coord,
      expect.any(Object)
    );
  });

  it('should throw error if no active game found in session on construction', () => {
    session.activeGame = undefined;
    
    expect(() => new CanvasController(canvas, session)).toThrow('No active game found in session');
  });

  it('should clean up all resources on destroy', () => {
    const cancelAnimationFrameSpy = vi.spyOn(window, 'cancelAnimationFrame');

    controller = new CanvasController(canvas, session);
    const inputManager = (controller as any).inputManager as any;
    inputManager.destroy = vi.fn();

    controller.destroy();

    expect(cancelAnimationFrameSpy).toHaveBeenCalled();
    expect(inputManager.destroy).toHaveBeenCalled();
  });
});
