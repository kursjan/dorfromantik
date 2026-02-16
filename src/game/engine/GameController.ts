import { Camera } from './Camera';
import { InputManager } from './InputManager';
import { HexRenderer } from '../graphics/HexRenderer';
import { HexCoordinate } from '../../models/HexCoordinate';
import { pixelToHex, HEX_SIZE } from '../utils/HexUtils';

export class GameController {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private camera: Camera;
  private renderer: HexRenderer;
  private inputManager: InputManager;
  private animationFrameId: number;
  private hoveredHex: HexCoordinate | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2d context');
    this.ctx = ctx;

    this.camera = new Camera(0, 0, 1);
    this.renderer = new HexRenderer(ctx);
    this.inputManager = new InputManager(canvas, {
      onPan: (dx, dy) => this.camera.pan(dx, dy),
      onZoom: (delta) => this.handleZoom(delta),
      onHover: (x, y) => this.handleHover(x, y),
    });

    // Debug access
    if (import.meta.env.DEV) {
      (window as any).game = this;
    }

    this.start();
  }

  public destroy() {
    this.stop();
    this.inputManager.detachListeners();
  }

  public start() {
    this.loop();
  }

  public stop() {
    cancelAnimationFrame(this.animationFrameId);
  }

  private loop() {
    this.update();
    this.render();
    this.animationFrameId = requestAnimationFrame(() => this.loop());
  }

  private update() {
    // Game logic (e.g., animations) goes here
  }

  private render() {
    // 1. Resize
    if (this.canvas.width !== window.innerWidth || this.canvas.height !== window.innerHeight) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }

    // 2. Clear
    this.ctx.fillStyle = '#f0f0f0';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 3. Camera Transform
    this.ctx.save();
    this.camera.applyTransform(this.ctx, this.canvas.width, this.canvas.height);

    // 4. Draw World
    this.renderer.drawDebugGrid(5);
    
    this.renderer.drawHighlight(this.hoveredHex);
    
    this.ctx.restore();

    // 5. UI Overlay
    this.renderOverlay();
  }

  private renderOverlay() {
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'alphabetic';
    this.ctx.fillStyle = 'black';
    this.ctx.font = '20px Arial';
    
    let debugText = `Camera: (${Math.round(this.camera.x)},${Math.round(this.camera.y)}) Zoom: ${this.camera.zoom.toFixed(2)}`;
    if (this.hoveredHex) {
        debugText += ` | Hover: (${this.hoveredHex.q},${this.hoveredHex.r},${this.hoveredHex.s})`;
    }
    this.ctx.fillText(debugText, 20, 30);
  }

  // --- Input Handlers ---

  private handleZoom(delta: number) {
    const ZOOM_SENSITIVITY = 0.001;
    const MIN_ZOOM = 0.5;
    const MAX_ZOOM = 3.0;
    
    this.camera.zoomBy(-delta * ZOOM_SENSITIVITY, MIN_ZOOM, MAX_ZOOM);
  }

  private handleHover(mouseX: number, mouseY: number) {
    const worldPos = this.camera.screenToWorld(mouseX, mouseY, this.canvas.width, this.canvas.height);
    const hex = pixelToHex(worldPos.x, worldPos.y, HEX_SIZE);
    
    if (!this.hoveredHex || !this.hoveredHex.equals(hex)) {
      this.hoveredHex = hex;
    }
  }
}
