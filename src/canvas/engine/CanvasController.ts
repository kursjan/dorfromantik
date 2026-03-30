import { Camera } from './Camera';
import { InputManager } from './InputManager';
import { HexRenderer } from '../graphics/HexRenderer';
import { TileRenderer } from '../graphics/TileRenderer';
import { BackgroundRenderer } from '../graphics/BackgroundRenderer';
import { HexCoordinate } from '../../models/HexCoordinate';
import { distanceToHex } from '../utils/HexUtils';
import {
  HEX_SIZE,
  DEFAULT_HEX_STYLE,
  VALID_PREVIEW_STYLE,
  INVALID_PREVIEW_STYLE,
  VALID_PLACEMENT_STYLE,
} from '../graphics/HexStyles';
import { Tile } from '../../models/Tile';
import { Game } from '../../models/Game';

export interface DebugStats {
  fps: number;
  camera: { x: number; y: number; zoom: number; rotation: number };
  hoveredHex: HexCoordinate | null;
}

interface DebugState {
  fps: number;
  lastDebugUpdateTime: number;
  lastLoopTime: number;
  listeners: Set<() => void>;
  snapshot: DebugStats;
}

export class CanvasController {
  private static readonly MIN_ZOOM = 0.5;
  private static readonly MAX_ZOOM = 3.0;
  private static readonly ROTATION_SPEED = 0.05;
  private static readonly ZOOM_SENSITIVITY = 0.001;

  /** Current game snapshot; reassigned when a move returns a new immutable `Game` instance. */
  private activeGame: Game;
  private readonly backgroundRenderer: BackgroundRenderer;
  private readonly canvas: HTMLCanvasElement;
  private readonly camera: Camera;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly inputManager: InputManager;
  private readonly hexRenderer: HexRenderer;
  private readonly tileRenderer: TileRenderer;

  private animationFrameId: number = 0;
  private debugState: DebugState = CanvasController.createDefaultDebugState();
  private hoveredHex: HexCoordinate | null = null;

  // Callbacks for React synchronization
  public onStatsChange?: (score: number, remainingTurns: number, nextTile: Tile | null) => void;
  public onTilePlaced?: () => void;

  private readonly onActiveGameChange?: (game: Game) => void;

  constructor(
    canvas: HTMLCanvasElement,
    activeGame: Game,
    options?: { onToggleDebugOverlay?: () => void; onActiveGameChange?: (game: Game) => void }
  ) {
    this.canvas = canvas;
    this.activeGame = activeGame;
    this.onActiveGameChange = options?.onActiveGameChange;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2d context');
    this.ctx = ctx;

    this.camera = new Camera({ x: 0, y: 0, zoom: 1 });
    this.backgroundRenderer = new BackgroundRenderer(ctx);
    this.hexRenderer = new HexRenderer(ctx);
    this.tileRenderer = new TileRenderer(ctx);
    this.inputManager = new InputManager(canvas, {
      onPan: (dx, dy) => this.handlePan(dx, dy),
      onZoom: (delta) => this.handleZoom(delta),
      onHover: (x, y) => this.handleHover(x, y),
      onLeave: () => this.handleLeave(),
      onClick: () => this.handleMouseClick(),
      onRotateClockwise: () => this.handleRotateClockwise(),
      onRotateCounterClockwise: () => this.handleRotateCounterClockwise(),
      onResize: () => this.handleResize(),
      onToggleDebugOverlay: options?.onToggleDebugOverlay,
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

  public subscribeDebug(listener: () => void): () => void {
    this.debugState.listeners.add(listener);
    return () => {
      this.debugState.listeners.delete(listener);
    };
  }

  public getDebugSnapshot(): DebugStats {
    return this.debugState.snapshot;
  }

  private loop() {
    this.updateFps();
    this.processContinuousInput();
    this.render();
    this.animationFrameId = requestAnimationFrame(() => this.loop());
  }

  private updateFps() {
    const now = performance.now();
    const deltaTime = now - this.debugState.lastLoopTime;
    this.debugState.lastLoopTime = now;
    if (deltaTime > 0) {
      this.debugState.fps = 1000 / deltaTime;
    }
  }

  private processContinuousInput() {
    const rotationDir = this.inputManager.getRotationDirection();
    if (rotationDir !== 0) {
      this.camera.rotateBy(rotationDir * CanvasController.ROTATION_SPEED);
    }
  }

  private render() {
    const activeGame = this.activeGame;
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
    this.hexRenderer.drawDebugGrid(5);

    // Draw placed tiles from the board
    for (const boardTile of activeGame.board.getAll()) {
      this.tileRenderer.drawTileAtHex(
        boardTile.tile,
        boardTile.coordinate,
        DEFAULT_HEX_STYLE,
        activeGame.board
      );
    }

    // Draw valid placement highlights
    for (const coord of activeGame.hints.validPlacements) {
      this.hexRenderer.drawHex(coord, VALID_PLACEMENT_STYLE);
    }

    // 4. Ghost Preview
    if (activeGame.inProgress() && this.hoveredHex) {
      const nextTile = activeGame.peek()!;
      const isValid = this.isValidPlacement(this.hoveredHex);
      const style = isValid ? VALID_PREVIEW_STYLE : INVALID_PREVIEW_STYLE;
      this.tileRenderer.drawTileAtHex(nextTile, this.hoveredHex, style, activeGame.board);
    }

    // Draw highlight for current mouse position
    this.hexRenderer.drawHighlight(this.hoveredHex);

    this.ctx.restore();
    this.publishDebugSnapshot();
  }

  private publishDebugSnapshot() {
    const now = performance.now();
    if (this.debugState.listeners.size === 0 || now - this.debugState.lastDebugUpdateTime <= 500) {
      return;
    }
    this.debugState.snapshot = {
      fps: Math.round(this.debugState.fps),
      camera: {
        x: this.camera.x,
        y: this.camera.y,
        zoom: this.camera.zoom,
        rotation: this.camera.rotation,
      },
      hoveredHex: this.hoveredHex,
    };
    this.debugState.lastDebugUpdateTime = now;
    this.debugState.listeners.forEach((listener) => listener());
  }

  private notifyStatsChange() {
    const activeGame = this.activeGame;
    if (this.onStatsChange) {
      this.onStatsChange(activeGame.score, activeGame.remainingTurns, activeGame.peek() || null);
    }
  }

  // --- Input Handlers ---

  private handlePan(dx: number, dy: number) {
    this.camera.pan(dx, dy);
  }

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

    const validCoords = this.activeGame.hints.validPlacements;

    if (validCoords.length === 0) {
      this.hoveredHex = null;
      return;
    }

    this.hoveredHex = CanvasController.findClosestHexCoordinate(
      [...validCoords],
      worldPos.x,
      worldPos.y
    );
  }

  private handleLeave() {
    this.hoveredHex = null;
  }

  private handleMouseClick() {
    const activeGame = this.activeGame;

    if (activeGame.inProgress() && this.hoveredHex && this.isValidPlacement(this.hoveredHex)) {
      const { game: nextGame } = activeGame.placeTile(this.hoveredHex);
      this.activeGame = nextGame;
      this.onActiveGameChange?.(nextGame);
      this.notifyStatsChange();
      this.onTilePlaced?.();
    }
  }

  private handleRotateClockwise() {
    const nextGame = this.activeGame.rotateQueuedTileClockwise();
    this.activeGame = nextGame;
    this.onActiveGameChange?.(nextGame);
    this.notifyStatsChange();
  }

  private handleRotateCounterClockwise() {
    const nextGame = this.activeGame.rotateQueuedTileCounterClockwise();
    this.activeGame = nextGame;
    this.onActiveGameChange?.(nextGame);
    this.notifyStatsChange();
  }

  private handleResize() {
    if (this.canvas.width !== window.innerWidth || this.canvas.height !== window.innerHeight) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
  }

  // --- Helpers ---

  private isValidPlacement(coord: HexCoordinate): boolean {
    return this.activeGame.isValidPlacement(coord);
  }

  private static createDefaultDebugState(): DebugState {
    return {
      fps: 0,
      lastDebugUpdateTime: 0,
      lastLoopTime: performance.now(),
      listeners: new Set<() => void>(),
      snapshot: {
        fps: 0,
        camera: { x: 0, y: 0, zoom: 1, rotation: 0 },
        hoveredHex: null,
      },
    };
  }

  private static findClosestHexCoordinate(
    validCoords: HexCoordinate[],
    x: number,
    y: number
  ): HexCoordinate {
    return validCoords
      .map((coord) => ({ coord, dist: distanceToHex(coord, x, y, HEX_SIZE) }))
      .sort((a, b) => a.dist - b.dist)[0].coord;
  }
}
