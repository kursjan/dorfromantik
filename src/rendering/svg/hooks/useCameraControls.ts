import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { radians } from '../../../utils/Angle';
import { Camera } from '../../common/camera/Camera';
import type { CameraSnapshot } from '../cameraSnapshot';
import {
  PointerPanZoomSession,
  applyWheelDeltaYToCamera,
  bindPointerInteraction,
} from '../../common/camera/cameraInteraction';

export interface UseCameraControlsCallbacks {
  onHover: (x: number, y: number) => void;
  onClick: (x: number, y: number) => void;
  onRotateClockwise: () => void;
  onRotateCounterClockwise: () => void;
  onLeave: () => void;
}

export function useCameraControls(
  containerRef: RefObject<HTMLElement | null>,
  callbacks: UseCameraControlsCallbacks
): {
  transform: CameraSnapshot;
  resetCamera: () => void;
  screenToWorld: (screenX: number, screenY: number) => { x: number; y: number };
} {
  const cameraRef = useRef(new Camera());
  const panPointerRef = useRef(new PointerPanZoomSession());
  const [transform, setTransform] = useState<CameraSnapshot>({
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
    const container = containerRef.current;
    if (!container) return;

    const panPointer = panPointerRef.current;
    const camera = cameraRef.current;

    const cleanup = bindPointerInteraction(
      container,
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
      const container = containerRef.current;
      if (!container) return { x: 0, y: 0 };
      const rect = container.getBoundingClientRect();
      return cameraRef.current.screenToWorld(screenX, screenY, rect.width, rect.height);
    },
    [containerRef]
  );

  return { transform, resetCamera, screenToWorld };
}

function readTransform(camera: Camera): CameraSnapshot {
  return {
    x: camera.x,
    y: camera.y,
    zoom: camera.zoom,
    rotation: camera.rotation,
  };
}
