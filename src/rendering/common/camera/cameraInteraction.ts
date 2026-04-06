import { ClientDelta, ClientPoint } from '../ClientPoint';
import { ContainerDelta, ContainerPoint } from '../ContainerPoint';
import type { Camera } from './Camera';

const CAMERA_INTERACTION = {
  minZoom: 0.5,
  maxZoom: 3.0,
  zoomSensitivity: 0.001,
  dragThresholdClient: ClientDelta.xy(5, 5),
} as const;

const MOUSE_BUTTON_PRIMARY = 0;
const MOUSE_BUTTON_SECONDARY = 2;

type PanZoomState = 'IDLE' | 'MOUSE_DOWN_POTENTIAL_CLICK' | 'PANNING';

type PanZoomMoveResult =
  | { type: 'none' }
  | { type: 'entered_pan' }
  | { type: 'pan'; delta: ClientDelta };

export class PointerPanZoomSession {
  private readonly dragThresholdClient: ClientDelta;

  private state: PanZoomState = 'IDLE';
  private mouseDownPoint: ClientPoint = ClientPoint.xy(0, 0);
  private lastPoint: ClientPoint = ClientPoint.xy(0, 0);

  constructor(dragThresholdClient: ClientDelta = CAMERA_INTERACTION.dragThresholdClient) {
    this.dragThresholdClient = dragThresholdClient;
  }

  beginLeftButton(clientPoint: ClientPoint): void {
    this.state = 'MOUSE_DOWN_POTENTIAL_CLICK';
    this.mouseDownPoint = clientPoint;
    this.lastPoint = clientPoint;
  }

  onClientMove(point: ClientPoint): PanZoomMoveResult {
    if (this.state === 'MOUSE_DOWN_POTENTIAL_CLICK') {
      return this.moveWhilePotentialClick(point);
    }
    if (this.state === 'PANNING') {
      return this.moveWhilePanning(point);
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

  private moveWhilePotentialClick(point: ClientPoint): PanZoomMoveResult {
    if (!this.exceedsDragThreshold(point)) {
      return { type: 'none' };
    }
    this.state = 'PANNING';
    this.lastPoint = point;
    return { type: 'entered_pan' };
  }

  private moveWhilePanning(point: ClientPoint): PanZoomMoveResult {
    const delta = ClientDelta.between(this.lastPoint, point);
    this.lastPoint = point;
    return { type: 'pan', delta };
  }

  private exceedsDragThreshold(point: ClientPoint): boolean {
    const d = ClientDelta.between(this.mouseDownPoint, point).absolute();
    return d.x > this.dragThresholdClient.x || d.y > this.dragThresholdClient.y;
  }
}

interface PointerInteractionCallbacks {
  onPan: (delta: ContainerDelta) => void;
  onZoom: (zoomDelta: number) => void;
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

    panPointer.beginLeftButton(ClientPoint.fromMouseEvent(e));
    syncCursor();
  };

  const handleMouseMove = (e: MouseEvent) => {
    callbacks.onHover(
      ContainerPoint.fromClientInElement(
        ClientPoint.fromMouseEvent(e),
        element.getBoundingClientRect()
      )
    );

    const panMove = panPointer.onClientMove(ClientPoint.fromMouseEvent(e));
    if (panMove.type === 'pan') {
      callbacks.onPan(ContainerDelta.fromClientDelta(panMove.delta));
    }
    if (panMove.type === 'entered_pan') {
      syncCursor();
    }
  };

  const finishInteraction = (containerPoint?: ContainerPoint) => {
    if (panPointer.isAwaitingClick() && containerPoint !== undefined) {
      callbacks.onClick(containerPoint);
    }
    panPointer.endLeftButton();
    syncCursor();
  };

  const handleMouseUp = (e: MouseEvent) => {
    const rect = element.getBoundingClientRect();
    finishInteraction(ContainerPoint.fromClientInElement(ClientPoint.fromMouseEvent(e), rect));
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
