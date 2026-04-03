import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import {
  PointerPanZoomSession,
  applyWheelDeltaYToCamera,
  cursorForPointerPanZoomState,
} from '../engine/cameraInteraction';
import { Camera } from '../engine/Camera';

export interface CameraTransform {
  x: number;
  y: number;
  zoom: number;
  rotation: number;
}

/**
 * Pan (left-drag after threshold) and zoom (wheel) using the same rules as canvas {@link InputManager}
 * / {@link Camera}, for SVG or other DOM-based views.
 */
export function useCameraControls(containerRef: RefObject<HTMLElement | null>): {
  transform: CameraTransform;
  resetCamera: () => void;
} {
  const cameraRef = useRef(new Camera());
  const panPointerRef = useRef(new PointerPanZoomSession());
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

    const panPointer = panPointerRef.current;
    const camera = cameraRef.current;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      applyWheelDeltaYToCamera(camera, e.deltaY);
      sync();
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      panPointer.beginLeftDrag(e.clientX, e.clientY);
      el.style.cursor = cursorForPointerPanZoomState(panPointer.state);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const move = panPointer.move(e.clientX, e.clientY);
      if (move.type === 'pan') {
        camera.pan(move.dx, move.dy);
        sync();
      }
      if (move.type === 'entered_pan') {
        el.style.cursor = cursorForPointerPanZoomState(panPointer.state);
      }
    };

    const handleMouseUp = () => {
      panPointer.endDrag();
      el.style.cursor = cursorForPointerPanZoomState(panPointer.state);
    };

    const handleMouseLeave = () => {
      panPointer.endDrag();
      el.style.cursor = cursorForPointerPanZoomState(panPointer.state);
    };

    el.style.cursor = cursorForPointerPanZoomState(panPointer.state);
    el.addEventListener('wheel', handleWheel, { passive: false });
    el.addEventListener('mousedown', handleMouseDown);
    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseup', handleMouseUp);
    el.addEventListener('mouseleave', handleMouseLeave);
    el.addEventListener('contextmenu', handleContextMenu);

    return () => {
      panPointer.endDrag();
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
