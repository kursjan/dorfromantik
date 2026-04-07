import { applyWheelDeltaYToCamera } from '../../common/camera/cameraInteraction';
import type { CameraSnapshot } from '../../common/camera/CameraSnapshot';
import {
  cameraContainerToWorld,
  panCameraSnapshotBy,
  rotateCameraSnapshotBy,
} from '../../common/camera/cameraTransforms';
import { InputManager } from './InputManager';
import { HexRenderer } from '../graphics/HexRenderer';
import { TileRenderer } from '../graphics/TileRenderer';
import { BackgroundRenderer } from '../graphics/BackgroundRenderer';
import { HexCoordinate } from '../../../models/HexCoordinate';
import type { ContainerDelta, ContainerPoint } from '../../common/ContainerPoint';
import { closestHexByWorldDistance } from '../../common/hex/HexUtils';
import {
  HEX_SIZE,
  DEFAULT_HEX_STYLE,
  VALID_PREVIEW_STYLE,
  INVALID_PREVIEW_STYLE,
  VALID_PLACEMENT_STYLE,
} from '../graphics/HexStyles';
import { Game } from '../../../models/Game';
import { radians } from '../../../utils/Angle';
import { DEFAULT_CAMERA_SNAPSHOT } from '../../common/camera/CameraSnapshot';

export interface DebugStats {
  fps: number;
  camera: CameraSnapshot;
  hoveredHex: HexCoordinate | null;
}

export interface CanvasControllerOptions {
  /** Latest immutable game snapshot (typically backed by a React ref updated in sync with context). */
  getGameSnapshot: () => Game;
  /** Commit the next immutable `Game` after place/rotate (e.g. ref + context setter from the view bridge). */
  setGameSnapshot: (game: Game) => void;
  onToggleDebugOverlay?: () => void;
}

interface DebugState {
  fps: number;
  lastDebugUpdateTime: number;
  lastLoopTime: number;
  listeners: Set<() => void>;
  snapshot: DebugStats;
}

export class CanvasController {
  private static readonly ROTATION_SPEED = 0.05;

  private readonly getGameSnapshot: () => Game;
  private readonly setGameSnapshot: (game: Game) => void;

  private readonly backgroundRenderer: BackgroundRenderer;
  private readonly canvas: HTMLCanvasElement;
  private cameraSnapshot: CameraSnapshot;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly inputManager: InputManager;
  private readonly hexRenderer: HexRenderer;
  private readonly tileRenderer: TileRenderer;

  private animationFrameId: number = 0;
  private debugState: DebugState = CanvasController.createDefaultDebugState();
  private hoveredHex: HexCoordinate | null = null;

  constructor(canvas: HTMLCanvasElement, options: CanvasControllerOptions) {
    this.canvas = canvas;
    this.getGameSnapshot = options.getGameSnapshot;
    this.setGameSnapshot = options.setGameSnapshot;
    this.ctx = this.getRequired2dContext(canvas);

    this.cameraSnapshot = { ...DEFAULT_CAMERA_SNAPSHOT };
    this.backgroundRenderer = new BackgroundRenderer(this.ctx);
    this.hexRenderer = new HexRenderer(this.ctx);
    this.tileRenderer = new TileRenderer(this.ctx);
    this.inputManager = new InputManager(canvas, {
      onPan: (containerDelta) => this.handlePan(containerDelta),
      onZoom: (zoomDelta) => this.handleZoom(zoomDelta),
      onHover: (containerPoint) => this.handleHover(containerPoint),
      onLeave: () => this.handleLeave(),
      onClick: (_containerPoint) => this.handleMouseClick(),
      onRotateClockwise: () => this.handleRotateClockwise(),
      onRotateCounterClockwise: () => this.handleRotateCounterClockwise(),
      onResize: () => this.handleResize(),
      onToggleDebugOverlay: options.onToggleDebugOverlay,
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
    this.cameraSnapshot = { ...DEFAULT_CAMERA_SNAPSHOT };
  }

  public get activeGame(): Game {
    return this.getGameSnapshot();
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
    if (rotationDir !== 0 && Number.isFinite(rotationDir)) {
      this.cameraSnapshot = rotateCameraSnapshotBy(
        this.cameraSnapshot,
        radians(rotationDir * CanvasController.ROTATION_SPEED)
      );
    }
  }

  private render() {
    const activeGame = this.getGameSnapshot();

    // 1. Clear
    this.backgroundRenderer.draw(this.canvas.width, this.canvas.height);

    // 2. Camera Transform
    this.ctx.save();
    this.applyCameraTransformToCanvas();

    // 3. Draw World
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

  private applyCameraTransformToCanvas(): void {
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.ctx.translate(w / 2, h / 2);
    this.ctx.rotate(this.cameraSnapshot.rotation);
    this.ctx.scale(this.cameraSnapshot.zoom, this.cameraSnapshot.zoom);
    this.ctx.translate(this.cameraSnapshot.position.x, this.cameraSnapshot.position.y);
  }

  private publishDebugSnapshot() {
    const now = performance.now();
    if (this.debugState.listeners.size === 0 || now - this.debugState.lastDebugUpdateTime <= 500) {
      return;
    }
    this.debugState.snapshot = {
      fps: Math.round(this.debugState.fps),
      camera: this.cameraSnapshot,
      hoveredHex: this.hoveredHex,
    };
    this.debugState.lastDebugUpdateTime = now;
    this.debugState.listeners.forEach((listener) => listener());
  }

  // --- Input Handlers ---

  private handlePan(containerDelta: ContainerDelta) {
    this.cameraSnapshot = panCameraSnapshotBy(this.cameraSnapshot, containerDelta);
  }

  private handleZoom(zoomDelta: number) {
    this.cameraSnapshot = applyWheelDeltaYToCamera(this.cameraSnapshot, zoomDelta);
  }

  private handleHover(containerPoint: ContainerPoint) {
    const worldPos = cameraContainerToWorld(
      this.cameraSnapshot,
      containerPoint,
      this.canvas.width,
      this.canvas.height
    );

    const validCoords = this.getGameSnapshot().hints.validPlacements;

    if (validCoords.length === 0) {
      this.hoveredHex = null;
      return;
    }

    this.hoveredHex = closestHexByWorldDistance(validCoords, worldPos, HEX_SIZE);
  }

  private handleLeave() {
    this.hoveredHex = null;
  }

  private handleMouseClick() {
    const activeGame = this.getGameSnapshot();
    if (!activeGame.inProgress()) return;
    if (!this.hoveredHex) return;
    if (!this.isValidPlacement(this.hoveredHex)) return;

    const { game: nextGame } = activeGame.placeTile(this.hoveredHex);
    this.setGameSnapshot(nextGame);
  }

  private handleRotateClockwise() {
    const nextGame = this.getGameSnapshot().rotateQueuedTileClockwise();
    this.setGameSnapshot(nextGame);
  }

  private handleRotateCounterClockwise() {
    const nextGame = this.getGameSnapshot().rotateQueuedTileCounterClockwise();
    this.setGameSnapshot(nextGame);
  }

  private handleResize() {
    if (this.canvas.width === window.innerWidth && this.canvas.height === window.innerHeight)
      return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  // --- Helpers ---

  private getRequired2dContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2d context');
    return ctx;
  }

  private isValidPlacement(coord: HexCoordinate): boolean {
    return this.getGameSnapshot().isValidPlacement(coord);
  }

  private static createDefaultDebugState(): DebugState {
    return {
      fps: 0,
      lastDebugUpdateTime: 0,
      lastLoopTime: performance.now(),
      listeners: new Set<() => void>(),
      snapshot: {
        fps: 0,
        camera: DEFAULT_CAMERA_SNAPSHOT,
        hoveredHex: null,
      },
    };
  }
}
