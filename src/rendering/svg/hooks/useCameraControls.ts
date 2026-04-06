import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { radians } from '../../../utils/Angle';
import { Camera } from '../../common/camera/Camera';
import type { ContainerDelta, ContainerPoint } from '../../common/ContainerPoint';
import { WORLD_ORIGIN, WorldPoint } from '../../common/WorldPoint';
import type { CameraSnapshot } from '../cameraSnapshot';
import {
  PointerPanZoomSession,
  applyWheelDeltaYToCamera,
  bindPointerInteraction,
} from '../../common/camera/cameraInteraction';

export type ContainerToWorldFn = (point: ContainerPoint) => WorldPoint;

export interface UseCameraControlsCallbacks {
  onHover: (point: ContainerPoint) => void;
  onClick: (point: ContainerPoint) => void;
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
  containerToWorld: ContainerToWorldFn;
} {
  const cameraRef = useRef(new Camera());
  const panPointerRef = useRef(new PointerPanZoomSession());
  const [transform, setTransform] = useState<CameraSnapshot>({
    position: WORLD_ORIGIN,
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
        onPan: (delta: ContainerDelta) => {
          camera.panBy(delta);
          sync();
        },
        onZoom: (deltaY) => {
          applyWheelDeltaYToCamera(camera, deltaY);
          sync();
        },
        onHover: (point) => callbacksRef.current.onHover(point),
        onClick: (point) => callbacksRef.current.onClick(point),
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

  const containerToWorld = useCallback(
    (point: ContainerPoint) => {
      const container = containerRef.current;
      if (!container) return WORLD_ORIGIN;
      const rect = container.getBoundingClientRect();
      return cameraRef.current.containerToWorld(point, rect.width, rect.height);
    },
    [containerRef]
  );

  return { transform, resetCamera, containerToWorld };
}

function readTransform(camera: Camera): CameraSnapshot {
  return {
    position: WorldPoint.xy(camera.pan.x, camera.pan.y),
    zoom: camera.zoom,
    rotation: camera.rotation,
  };
}
