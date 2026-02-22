import { Camera } from './Camera';
import { InputManager } from './InputManager';
import { HexRenderer } from '../graphics/HexRenderer';
import { TileRenderer } from '../graphics/TileRenderer';
import { DebugRenderer } from '../graphics/DebugRenderer';
import { BackgroundRenderer } from '../graphics/BackgroundRenderer';
import { HexCoordinate } from '../../models/HexCoordinate';
import { pixelToHex } from '../utils/HexUtils';
import { HEX_SIZE, DEFAULT_HEX_STYLE } from '../graphics/HexStyles';
import { Session } from '../../models/Session';

export class CanvasController {
  private static readonly ZOOM_SENSITIVITY = 0.001;
  private static readonly ROTATION_SPEED = 0.05;
  private static readonly MIN_ZOOM = 0.5;
  private static readonly MAX_ZOOM = 3.0;

  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly camera: Camera;
  private readonly renderer: HexRenderer;
  private readonly tileRenderer: TileRenderer;
  private readonly debugRenderer: DebugRenderer;
  private readonly backgroundRenderer: BackgroundRenderer;
  private readonly inputManager: InputManager;
  private readonly session: Session;

  // Callback for React HUD synchronization
  public onStatsChange?: (score: number, remainingTurns: number) => void;

  // State
  private animationFrameId: number = 0;
  private hoveredHex: HexCoordinate | null = null;

  constructor(canvas: HTMLCanvasElement, session: Session) {
    this.canvas = canvas;
    this.session = session;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2d context');
    this.ctx = ctx;

    this.camera = new Camera({ x: 0, y: 0, zoom: 1 });
    this.backgroundRenderer = new BackgroundRenderer(ctx);
    this.renderer = new HexRenderer(ctx);
    this.tileRenderer = new TileRenderer(ctx);
    this.debugRenderer = new DebugRenderer(ctx);
    this.inputManager = new InputManager(canvas, {
      onPan: (dx, dy) => this.camera.pan(dx, dy),
      onZoom: (delta) => this.handleZoom(delta),
      onHover: (x, y) => this.handleHover(x, y),
      onClick: (x, y) => this.handleMouseClick(x, y),
      onLeave: () => this.handleLeave(),
      onResize: () => this.handleResize(),
    });

    // Handle Resize (Initial)
    this.handleResize();

    // Debug access
    if (import.meta.env.DEV) {
      window.canvasCtrl = this;
    }

    this.loop();
  }

  public destroy() {
    cancelAnimationFrame(this.animationFrameId);
    this.inputManager.destroy();
  }

  public resetCamera() {
    this.camera.reset();
  }

  private loop() {
    this.update();
    this.render();
    this.animationFrameId = requestAnimationFrame(() => this.loop());
  }

  private update() {
    // 1. Handle Continuous Rotation Input
    const rotationDir = this.inputManager.getRotationDirection();
    if (rotationDir !== 0) {
      this.camera.rotateBy(rotationDir * CanvasController.ROTATION_SPEED);
    }
  }

  private render() {
    const activeGame = this.session.activeGame;
    if (!activeGame) {
      throw new Error('No active game found in session');
    }

    // 1. Clear
    this.backgroundRenderer.draw(this.canvas.width, this.canvas.height);

    // 2. Camera Transform
    this.ctx.save();
    this.camera.applyTransform(this.ctx, this.canvas.width, this.canvas.height);

    // 3. Draw World
    // Draw base grid (debug)
    this.renderer.drawDebugGrid(5);

    // Draw placed tiles from the board
    for (const boardTile of activeGame.board.getAll()) {
      this.tileRenderer.drawTileAtHex(boardTile.tile, boardTile.coordinate, DEFAULT_HEX_STYLE);
    }

    // 4. Ghost Preview for valid placement
    if (this.hoveredHex && this.isValidPlacement(this.hoveredHex)) {
      const nextTile = activeGame.peek();
      if (!nextTile) {
        throw new Error('No tiles remaining in the queue for preview');
      }
      this.tileRenderer.drawTileAtHex(nextTile, this.hoveredHex, {
        ...DEFAULT_HEX_STYLE,
        fillOpacity: 0.5,
        strokeOpacity: 0.5,
      });
    }

    // Draw highlight for current mouse position
    this.renderer.drawHighlight(this.hoveredHex);

    this.ctx.restore();

    // 5. UI Overlay
    this.debugRenderer.drawOverlay(this.camera, this.hoveredHex);
  }

  // --- Input Handlers ---

  private isValidPlacement(coord: HexCoordinate): boolean {
    return this.session.activeGame?.isValidPlacement(coord) ?? false;
  }

  private handleMouseClick(mouseX: number, mouseY: number) {
    const activeGame = this.session.activeGame;
    if (!activeGame) return;

    const worldPos = this.camera.screenToWorld(
      mouseX,
      mouseY,
      this.canvas.width,
      this.canvas.height
    );
    const hex = pixelToHex(worldPos.x, worldPos.y, HEX_SIZE);

    if (this.isValidPlacement(hex)) {
      activeGame.placeTile(hex);

      // Notify React HUD
      if (this.onStatsChange) {
        this.onStatsChange(activeGame.score, activeGame.remainingTurns);
      }
    }
  }

  private handleResize = () => {
    if (this.canvas.width !== window.innerWidth || this.canvas.height !== window.innerHeight) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
  };

  private handleZoom(delta: number) {
    this.camera.zoomBy(
      -delta * CanvasController.ZOOM_SENSITIVITY,
      CanvasController.MIN_ZOOM,
      CanvasController.MAX_ZOOM
    );
  }

  private handleHover(mouseX: number, mouseY: number) {
    const worldPos = this.camera.screenToWorld(
      mouseX,
      mouseY,
      this.canvas.width,
      this.canvas.height
    );
    const hex = pixelToHex(worldPos.x, worldPos.y, HEX_SIZE);

    if (!this.hoveredHex || !this.hoveredHex.equals(hex)) {
      this.hoveredHex = hex;
    }
  }

  private handleLeave() {
    this.hoveredHex = null;
  }
}
