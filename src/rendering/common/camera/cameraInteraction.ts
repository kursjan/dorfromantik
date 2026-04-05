import type { ClientPoint } from '../ClientPoint';
import type { ContainerDelta, ContainerPoint } from '../ContainerPoint';
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
  | { type: 'pan'; delta: ContainerDelta };

export function cursorForPointerPanZoomState(state: PointerPanZoomState): 'grab' | 'grabbing' {
  return state === 'PANNING' ? 'grabbing' : 'grab';
}

/**
 * Left-button drag threshold and pan deltas shared by {@link InputManager} and {@link useCameraControls}.
 */
export class PointerPanZoomSession {
  state: PointerPanZoomState = 'IDLE';
  private mouseDownClient: ClientPoint = { x: 0, y: 0 };
  private lastClient: ClientPoint = { x: 0, y: 0 };
  private readonly dragThresholdPx: number;

  constructor(dragThresholdPx: number = CAMERA_INTERACTION.dragThresholdPx) {
    this.dragThresholdPx = dragThresholdPx;
  }

  beginLeftDrag(client: ClientPoint): void {
    this.state = 'MOUSE_DOWN_POTENTIAL_CLICK';
    this.mouseDownClient = { x: client.x, y: client.y };
    this.lastClient = { x: client.x, y: client.y };
  }

  move(client: ClientPoint): PointerPanZoomMoveResult {
    switch (this.state) {
      case 'MOUSE_DOWN_POTENTIAL_CLICK': {
        const dx = Math.abs(client.x - this.mouseDownClient.x);
        const dy = Math.abs(client.y - this.mouseDownClient.y);
        if (dx > this.dragThresholdPx || dy > this.dragThresholdPx) {
          this.state = 'PANNING';
          this.lastClient = { x: client.x, y: client.y };
          return { type: 'entered_pan' };
        }
        return { type: 'none' };
      }
      case 'PANNING': {
        const delta: ContainerDelta = {
          x: client.x - this.lastClient.x,
          y: client.y - this.lastClient.y,
        };
        this.lastClient = { x: client.x, y: client.y };
        return { type: 'pan', delta };
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
  onPan: (delta: ContainerDelta) => void;
  onZoom: (deltaY: number) => void;
  onHover: (point: ContainerPoint) => void;
  onClick: (point: ContainerPoint) => void;
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

    panPointer.beginLeftDrag({ x: e.clientX, y: e.clientY } satisfies ClientPoint);
    syncCursor();
  };

  const handleMouseMove = (e: MouseEvent) => {
    const rect = element.getBoundingClientRect();
    const containerX = e.clientX - rect.left;
    const containerY = e.clientY - rect.top;
    callbacks.onHover({ x: containerX, y: containerY } satisfies ContainerPoint);

    const move = panPointer.move({ x: e.clientX, y: e.clientY } satisfies ClientPoint);
    if (move.type === 'pan') {
      callbacks.onPan(move.delta);
    }
    if (move.type === 'entered_pan') {
      syncCursor();
    }
  };

  const finishInteraction = (containerPoint?: ContainerPoint) => {
    if (panPointer.isAwaitingClick() && containerPoint !== undefined) {
      callbacks.onClick(containerPoint);
    }
    panPointer.endDrag();
    syncCursor();
  };

  const handleMouseUp = (e: MouseEvent) => {
    const rect = element.getBoundingClientRect();
    finishInteraction({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    } satisfies ContainerPoint);
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
