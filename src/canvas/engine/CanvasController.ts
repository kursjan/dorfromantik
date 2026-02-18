import { Camera } from './Camera';
import { InputManager } from './InputManager';
import { HexRenderer } from '../graphics/HexRenderer';
import { DebugRenderer } from '../graphics/DebugRenderer';
import { BackgroundRenderer } from '../graphics/BackgroundRenderer';
import { HexCoordinate } from '../../models/HexCoordinate';
import { pixelToHex } from '../utils/HexUtils';
import { HEX_SIZE } from '../graphics/HexStyles';

export class CanvasController {
  private static readonly ZOOM_SENSITIVITY = 0.001;
  private static readonly ROTATION_SPEED = 0.05;
  private static readonly MIN_ZOOM = 0.5;
  private static readonly MAX_ZOOM = 3.0;

  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly camera: Camera;
  private readonly renderer: HexRenderer;
  private readonly debugRenderer: DebugRenderer;
  private readonly backgroundRenderer: BackgroundRenderer;
  private readonly inputManager: InputManager;

  // State
  private animationFrameId: number = 0;
  private hoveredHex: HexCoordinate | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2d context');
    this.ctx = ctx;

    this.camera = new Camera({ x: 0, y: 0, zoom: 1 });
    this.backgroundRenderer = new BackgroundRenderer(ctx);
    this.renderer = new HexRenderer(ctx);
    this.debugRenderer = new DebugRenderer(ctx);
    this.inputManager = new InputManager(canvas, {
      onPan: (dx, dy) => this.camera.pan(dx, dy),
      onZoom: (delta) => this.handleZoom(delta),
      onHover: (x, y) => this.handleHover(x, y),
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
      
      // We need to re-evaluate hover during rotation, even if mouse doesn't move.
      // We can get the last known mouse position from inputManager if we exposed it,
      // or just wait for the next mouse event. 
      // Ideally, InputManager should expose `getLastMousePos()`.
      // For now, let's keep it simple: the highlight updates when you wiggle the mouse.
    }
  }

  private render() {
    // 1. Clear
    this.backgroundRenderer.draw(this.canvas.width, this.canvas.height);

    // 2. Camera Transform
    this.ctx.save();
    this.camera.applyTransform(this.ctx, this.canvas.width, this.canvas.height);

    // 3. Draw World
    this.renderer.drawDebugGrid(5);
    this.renderer.drawHighlight(this.hoveredHex);
    
    this.ctx.restore();

    // 4. UI Overlay
    this.debugRenderer.drawOverlay(this.camera, this.hoveredHex);
  }

  // --- Input Handlers ---

  private handleResize = () => {
    if (this.canvas.width !== window.innerWidth || this.canvas.height !== window.innerHeight) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
  };

  private handleZoom(delta: number) {
    this.camera.zoomBy(-delta * CanvasController.ZOOM_SENSITIVITY, CanvasController.MIN_ZOOM, CanvasController.MAX_ZOOM);
  }

  private handleHover(mouseX: number, mouseY: number) {
    const worldPos = this.camera.screenToWorld(mouseX, mouseY, this.canvas.width, this.canvas.height);
    const hex = pixelToHex(worldPos.x, worldPos.y, HEX_SIZE);
    
    if (!this.hoveredHex || !this.hoveredHex.equals(hex)) {
      this.hoveredHex = hex;
    }
  }

  private handleLeave() {
    this.hoveredHex = null;
  }
}
