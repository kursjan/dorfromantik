import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { Camera } from '../engine/Camera';

/** Matches {@link CanvasController} zoom limits and wheel sensitivity. */
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3.0;
const ZOOM_SENSITIVITY = 0.001;

/** Matches {@link InputManager} drag threshold before pan starts. */
const DRAG_THRESHOLD = 5;

export interface CameraTransform {
  x: number;
  y: number;
  zoom: number;
  rotation: number;
}

type InputState = 'IDLE' | 'MOUSE_DOWN_POTENTIAL_CLICK' | 'PANNING';

/**
 * Pan (left-drag after threshold) and zoom (wheel) using the same rules as canvas {@link InputManager}
 * / {@link Camera}, for SVG or other DOM-based views.
 */
export function useCameraControls(containerRef: RefObject<HTMLElement | null>): {
  transform: CameraTransform;
  resetCamera: () => void;
} {
  const cameraRef = useRef(new Camera());
  const [transform, setTransform] = useState<CameraTransform>({
    x: 0,
    y: 0,
    zoom: 1,
    rotation: 0,
  });

  const sync = useCallback(() => {
    setTransform(readTransform(cameraRef.current));
  }, []);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let state: InputState = 'IDLE';
    const mouseDownPos = { x: 0, y: 0 };
    const lastMousePos = { x: 0, y: 0 };
    const camera = cameraRef.current;

    const transition = (next: InputState) => {
      state = next;
      if (next === 'PANNING') {
        el.style.cursor = 'grabbing';
      } else {
        el.style.cursor = 'grab';
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.zoomBy(-e.deltaY * ZOOM_SENSITIVITY, MIN_ZOOM, MAX_ZOOM);
      sync();
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      transition('MOUSE_DOWN_POTENTIAL_CLICK');
      mouseDownPos.x = e.clientX;
      mouseDownPos.y = e.clientY;
      lastMousePos.x = e.clientX;
      lastMousePos.y = e.clientY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      switch (state) {
        case 'MOUSE_DOWN_POTENTIAL_CLICK': {
          const dx = Math.abs(e.clientX - mouseDownPos.x);
          const dy = Math.abs(e.clientY - mouseDownPos.y);
          if (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD) {
            transition('PANNING');
            lastMousePos.x = e.clientX;
            lastMousePos.y = e.clientY;
          }
          break;
        }
        case 'PANNING': {
          const dx = e.clientX - lastMousePos.x;
          const dy = e.clientY - lastMousePos.y;
          lastMousePos.x = e.clientX;
          lastMousePos.y = e.clientY;
          camera.pan(dx, dy);
          sync();
          break;
        }
        default:
          break;
      }
    };

    const handleMouseUp = () => {
      transition('IDLE');
    };

    const handleMouseLeave = () => {
      transition('IDLE');
    };

    el.style.cursor = 'grab';
    el.addEventListener('wheel', handleWheel, { passive: false });
    el.addEventListener('mousedown', handleMouseDown);
    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseup', handleMouseUp);
    el.addEventListener('mouseleave', handleMouseLeave);
    el.addEventListener('contextmenu', handleContextMenu);

    return () => {
      el.removeEventListener('wheel', handleWheel);
      el.removeEventListener('mousedown', handleMouseDown);
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseup', handleMouseUp);
      el.removeEventListener('mouseleave', handleMouseLeave);
      el.removeEventListener('contextmenu', handleContextMenu);
      el.style.cursor = '';
    };
  }, [containerRef, sync]);

  const resetCamera = useCallback(() => {
    cameraRef.current.reset();
    sync();
  }, [sync]);

  return { transform, resetCamera };
}

function readTransform(camera: Camera): CameraTransform {
  return {
    x: camera.x,
    y: camera.y,
    zoom: camera.zoom,
    rotation: camera.rotation,
  };
}
