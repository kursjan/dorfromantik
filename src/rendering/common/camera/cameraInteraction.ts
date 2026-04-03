import type { Camera } from './Camera';

/**
 * Shared tuning for canvas and DOM (SVG) views so pan/zoom feel identical.
 */
export const CAMERA_INTERACTION = {
  minZoom: 0.5,
  maxZoom: 3.0,
  zoomSensitivity: 0.001,
  /** Pixels of movement before left-drag is treated as pan instead of click. */
  dragThresholdPx: 5,
} as const;

export function applyWheelDeltaYToCamera(camera: Camera, deltaY: number): void {
  camera.zoomBy(
    -deltaY * CAMERA_INTERACTION.zoomSensitivity,
    CAMERA_INTERACTION.minZoom,
    CAMERA_INTERACTION.maxZoom
  );
}

export type PointerPanZoomState = 'IDLE' | 'MOUSE_DOWN_POTENTIAL_CLICK' | 'PANNING';

export type PointerPanZoomMoveResult =
  | { type: 'none' }
  | { type: 'entered_pan' }
  | { type: 'pan'; dx: number; dy: number };

export function cursorForPointerPanZoomState(state: PointerPanZoomState): 'grab' | 'grabbing' {
  return state === 'PANNING' ? 'grabbing' : 'grab';
}

/**
 * Left-button drag threshold and pan deltas shared by {@link InputManager} and {@link useCameraControls}.
 */
export class PointerPanZoomSession {
  state: PointerPanZoomState = 'IDLE';
  private mouseDownPos = { x: 0, y: 0 };
  private lastMousePos = { x: 0, y: 0 };
  private readonly dragThresholdPx: number;

  constructor(dragThresholdPx: number = CAMERA_INTERACTION.dragThresholdPx) {
    this.dragThresholdPx = dragThresholdPx;
  }

  beginLeftDrag(clientX: number, clientY: number): void {
    this.state = 'MOUSE_DOWN_POTENTIAL_CLICK';
    this.mouseDownPos = { x: clientX, y: clientY };
    this.lastMousePos = { x: clientX, y: clientY };
  }

  move(clientX: number, clientY: number): PointerPanZoomMoveResult {
    switch (this.state) {
      case 'MOUSE_DOWN_POTENTIAL_CLICK': {
        const dx = Math.abs(clientX - this.mouseDownPos.x);
        const dy = Math.abs(clientY - this.mouseDownPos.y);
        if (dx > this.dragThresholdPx || dy > this.dragThresholdPx) {
          this.state = 'PANNING';
          this.lastMousePos = { x: clientX, y: clientY };
          return { type: 'entered_pan' };
        }
        return { type: 'none' };
      }
      case 'PANNING': {
        const dx = clientX - this.lastMousePos.x;
        const dy = clientY - this.lastMousePos.y;
        this.lastMousePos = { x: clientX, y: clientY };
        return { type: 'pan', dx, dy };
      }
      default:
        return { type: 'none' };
    }
  }

  endDrag(): void {
    this.state = 'IDLE';
  }

  /** True on mouseup while still in "potential click" — caller may emit a click at local coords. */
  isAwaitingClick(): boolean {
    return this.state === 'MOUSE_DOWN_POTENTIAL_CLICK';
  }
}

export interface PointerInteractionCallbacks {
  onPan: (dx: number, dy: number) => void;
  onZoom: (deltaY: number) => void;
  onHover: (x: number, y: number) => void;
  onClick: (x: number, y: number) => void;
  onRotateClockwise: () => void;
  onRotateCounterClockwise: () => void;
  onLeave: () => void;
}

export function bindPointerInteraction(
  element: HTMLElement,
  callbacks: PointerInteractionCallbacks,
  panPointer: PointerPanZoomSession
): () => void {
  const syncCursor = () => {
    element.style.cursor = cursorForPointerPanZoomState(panPointer.state);
  };

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    callbacks.onZoom(e.deltaY);
  };

  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (e.button === 2) {
      if (e.shiftKey) {
        callbacks.onRotateCounterClockwise();
      } else {
        callbacks.onRotateClockwise();
      }
      return;
    }

    if (e.button !== 0) return;

    panPointer.beginLeftDrag(e.clientX, e.clientY);
    syncCursor();
  };

  const handleMouseMove = (e: MouseEvent) => {
    const rect = element.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    callbacks.onHover(mouseX, mouseY);

    const move = panPointer.move(e.clientX, e.clientY);
    if (move.type === 'pan') {
      callbacks.onPan(move.dx, move.dy);
    }
    if (move.type === 'entered_pan') {
      syncCursor();
    }
  };

  const finishInteraction = (mouseX?: number, mouseY?: number) => {
    if (panPointer.isAwaitingClick() && mouseX !== undefined && mouseY !== undefined) {
      callbacks.onClick(mouseX, mouseY);
    }
    panPointer.endDrag();
    syncCursor();
  };

  const handleMouseUp = (e: MouseEvent) => {
    const rect = element.getBoundingClientRect();
    finishInteraction(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleMouseLeave = () => {
    finishInteraction();
    callbacks.onLeave();
  };

  syncCursor();
  element.addEventListener('wheel', handleWheel, { passive: false });
  element.addEventListener('mousedown', handleMouseDown);
  element.addEventListener('mousemove', handleMouseMove);
  element.addEventListener('mouseup', handleMouseUp);
  element.addEventListener('mouseleave', handleMouseLeave);
  element.addEventListener('contextmenu', handleContextMenu);

  return () => {
    panPointer.endDrag();
    element.removeEventListener('wheel', handleWheel);
    element.removeEventListener('mousedown', handleMouseDown);
    element.removeEventListener('mousemove', handleMouseMove);
    element.removeEventListener('mouseup', handleMouseUp);
    element.removeEventListener('mouseleave', handleMouseLeave);
    element.removeEventListener('contextmenu', handleContextMenu);
    element.style.cursor = '';
  };
}
