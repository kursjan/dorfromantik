import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { radians } from '../../../utils/Angle';
import { Camera } from '../../common/camera/Camera';
import {
  PointerPanZoomSession,
  applyWheelDeltaYToCamera,
  bindPointerInteraction,
} from '../../common/camera/cameraInteraction';

/** React state snapshot of {@link Camera}; synced via `readTransform` in this module. */
export type CameraTransform = Pick<Camera, 'x' | 'y' | 'zoom' | 'rotation'>;

export interface UseCameraControlsCallbacks {
  onHover: (x: number, y: number) => void;
  onClick: (x: number, y: number) => void;
  onRotateClockwise: () => void;
  onRotateCounterClockwise: () => void;
  onLeave: () => void;
}

/**
 * Pan (left-drag after threshold) and zoom (wheel) using the same rules as canvas {@link InputManager}
 * / {@link Camera}, for SVG or other DOM-based views.
 */
export function useCameraControls(
  containerRef: RefObject<HTMLElement | null>,
  callbacks: UseCameraControlsCallbacks
): {
  transform: CameraTransform;
  resetCamera: () => void;
  screenToWorld: (screenX: number, screenY: number) => { x: number; y: number };
} {
  const cameraRef = useRef(new Camera());
  const panPointerRef = useRef(new PointerPanZoomSession());
  const [transform, setTransform] = useState<CameraTransform>({
    x: 0,
    y: 0,
    zoom: 1,
    rotation: radians(0),
  });

  // Store callbacks in a ref to avoid re-binding listeners on every render
  const callbacksRef = useRef(callbacks);
  useLayoutEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  const sync = useCallback(() => {
    setTransform(readTransform(cameraRef.current));
  }, []);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const panPointer = panPointerRef.current;
    const camera = cameraRef.current;

    const cleanup = bindPointerInteraction(
      el,
      {
        onPan: (dx, dy) => {
          camera.pan(dx, dy);
          sync();
        },
        onZoom: (deltaY) => {
          applyWheelDeltaYToCamera(camera, deltaY);
          sync();
        },
        onHover: (x, y) => callbacksRef.current.onHover(x, y),
        onClick: (x, y) => callbacksRef.current.onClick(x, y),
        onRotateClockwise: () => callbacksRef.current.onRotateClockwise(),
        onRotateCounterClockwise: () => callbacksRef.current.onRotateCounterClockwise(),
        onLeave: () => callbacksRef.current.onLeave(),
      },
      panPointer
    );

    return cleanup;
  }, [containerRef, sync]);

  const resetCamera = useCallback(() => {
    cameraRef.current.reset();
    sync();
  }, [sync]);

  const screenToWorld = useCallback(
    (screenX: number, screenY: number) => {
      const el = containerRef.current;
      if (!el) return { x: 0, y: 0 };
      const rect = el.getBoundingClientRect();
      return cameraRef.current.screenToWorld(screenX, screenY, rect.width, rect.height);
    },
    [containerRef]
  );

  return { transform, resetCamera, screenToWorld };
}

function readTransform(camera: Camera): CameraTransform {
  return {
    x: camera.x,
    y: camera.y,
    zoom: camera.zoom,
    rotation: camera.rotation,
  };
}
