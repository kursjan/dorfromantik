import type { ClientPoint } from '../ClientPoint';
import type { ContainerDelta, ContainerPoint } from '../ContainerPoint';
import type { Camera } from './Camera';

const CAMERA_INTERACTION = {
  minZoom: 0.5,
  maxZoom: 3.0,
  zoomSensitivity: 0.001,
  dragThresholdClientPx: 5,
} as const;

/** `MouseEvent.button`: primary (usually left). */
const MOUSE_BUTTON_PRIMARY = 0;
/** `MouseEvent.button`: secondary (usually right). */
const MOUSE_BUTTON_SECONDARY = 2;

type PanZoomState = 'IDLE' | 'MOUSE_DOWN_POTENTIAL_CLICK' | 'PANNING';

type PanZoomMoveResult =
  | { type: 'none' }
  | { type: 'entered_pan' }
  | { type: 'pan'; delta: ContainerDelta };

export class PointerPanZoomSession {
  private readonly dragThresholdClientPx: number;

  private state: PanZoomState = 'IDLE';
  private mouseDownClient: ClientPoint = { x: 0, y: 0 };
  private lastClient: ClientPoint = { x: 0, y: 0 };

  constructor(dragThresholdClientPx: number = CAMERA_INTERACTION.dragThresholdClientPx) {
    this.dragThresholdClientPx = dragThresholdClientPx;
  }

  beginLeftButton(client: ClientPoint): void {
    this.state = 'MOUSE_DOWN_POTENTIAL_CLICK';
    this.mouseDownClient = { x: client.x, y: client.y };
    this.lastClient = { x: client.x, y: client.y };
  }

  onClientMove(client: ClientPoint): PanZoomMoveResult {
    if (this.state === 'MOUSE_DOWN_POTENTIAL_CLICK') {
      return this.moveWhilePotentialClick(client);
    }
    if (this.state === 'PANNING') {
      return this.moveWhilePanning(client);
    }
    return { type: 'none' };
  }

  endLeftButton(): void {
    this.state = 'IDLE';
  }

  isAwaitingClick(): boolean {
    return this.state === 'MOUSE_DOWN_POTENTIAL_CLICK';
  }

  cursorStyle(): 'grab' | 'grabbing' {
    return this.state === 'PANNING' ? 'grabbing' : 'grab';
  }

  private moveWhilePotentialClick(client: ClientPoint): PanZoomMoveResult {
    if (!this.exceedsDragThreshold(client)) {
      return { type: 'none' };
    }
    this.state = 'PANNING';
    this.lastClient = { x: client.x, y: client.y } satisfies ClientPoint;
    return { type: 'entered_pan' };
  }

  private moveWhilePanning(client: ClientPoint): PanZoomMoveResult {
    const delta: ContainerDelta = {
      x: client.x - this.lastClient.x,
      y: client.y - this.lastClient.y,
    };
    this.lastClient = { x: client.x, y: client.y };
    return { type: 'pan', delta };
  }

  private exceedsDragThreshold(client: ClientPoint): boolean {
    const dx = Math.abs(client.x - this.mouseDownClient.x);
    const dy = Math.abs(client.y - this.mouseDownClient.y);
    return dx > this.dragThresholdClientPx || dy > this.dragThresholdClientPx;
  }
}

interface PointerInteractionCallbacks {
  onPan: (delta: ContainerDelta) => void;
  onZoom: (deltaY: number) => void;
  onHover: (point: ContainerPoint) => void;
  onClick: (point: ContainerPoint) => void;
  onRotateClockwise: () => void;
  onRotateCounterClockwise: () => void;
  onLeave: () => void;
}

/** Map viewport {@link ClientPoint} into element-local {@link ContainerPoint} using `getBoundingClientRect()`. */
function clientToContainerPoint(client: ClientPoint, elementRect: DOMRect): ContainerPoint {
  return {
    x: client.x - elementRect.left,
    y: client.y - elementRect.top,
  } satisfies ContainerPoint;
}

export function bindPointerInteraction(
  element: HTMLElement,
  callbacks: PointerInteractionCallbacks,
  panPointer: PointerPanZoomSession
): () => void {
  const syncCursor = () => {
    element.style.cursor = panPointer.cursorStyle();
  };

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    callbacks.onZoom(e.deltaY);
  };

  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (e.button === MOUSE_BUTTON_SECONDARY) {
      if (e.shiftKey) {
        callbacks.onRotateCounterClockwise();
      } else {
        callbacks.onRotateClockwise();
      }
      return;
    }

    if (e.button !== MOUSE_BUTTON_PRIMARY) return;

    panPointer.beginLeftButton({ x: e.clientX, y: e.clientY } satisfies ClientPoint);
    syncCursor();
  };

  const handleMouseMove = (e: MouseEvent) => {
    callbacks.onHover(
      clientToContainerPoint(
        { x: e.clientX, y: e.clientY } satisfies ClientPoint,
        element.getBoundingClientRect()
      )
    );

    const panMove = panPointer.onClientMove({ x: e.clientX, y: e.clientY } satisfies ClientPoint);
    if (panMove.type === 'pan') {
      callbacks.onPan(panMove.delta satisfies ContainerDelta);
    }
    if (panMove.type === 'entered_pan') {
      syncCursor();
    }
  };

  const finishInteraction = (containerPoint?: ContainerPoint) => {
    // ContainerPoint can be undefined if the user left the element without a matching mouseup coords path.
    if (panPointer.isAwaitingClick() && containerPoint !== undefined) {
      callbacks.onClick(containerPoint);
    }
    panPointer.endLeftButton();
    syncCursor();
  };

  const handleMouseUp = (e: MouseEvent) => {
    const rect = element.getBoundingClientRect();
    finishInteraction(
      clientToContainerPoint({ x: e.clientX, y: e.clientY } satisfies ClientPoint, rect)
    );
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
    panPointer.endLeftButton();
    element.removeEventListener('wheel', handleWheel);
    element.removeEventListener('mousedown', handleMouseDown);
    element.removeEventListener('mousemove', handleMouseMove);
    element.removeEventListener('mouseup', handleMouseUp);
    element.removeEventListener('mouseleave', handleMouseLeave);
    element.removeEventListener('contextmenu', handleContextMenu);
    element.style.cursor = '';
  };
}

export function applyWheelDeltaYToCamera(camera: Camera, deltaY: number): void {
  camera.zoomBy(
    -deltaY * CAMERA_INTERACTION.zoomSensitivity,
    CAMERA_INTERACTION.minZoom,
    CAMERA_INTERACTION.maxZoom
  );
}
