import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { radians } from '../../../utils/Angle';
import { Camera } from '../../common/camera/Camera';
import type { ContainerDelta, ContainerPoint } from '../../common/ContainerPoint';
import { WORLD_ORIGIN, WorldPoint } from '../../common/WorldPoint';
import type { CameraSnapshot } from '../../common/camera/CameraSnapshot';
import {
  PointerPanZoomSession,
  applyWheelDeltaYToCamera,
  bindPointerInteraction,
  type PointerInteractionCallbacks,
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
  camera: CameraSnapshot;
  resetCamera: () => void;
  containerToWorld: ContainerToWorldFn;
} {
  const cameraRef = useRef(new Camera());
  const panPointerRef = useRef(new PointerPanZoomSession());
  const [camera, setCamera] = useState<CameraSnapshot>({
    position: WORLD_ORIGIN,
    zoom: 1,
    rotation: radians(0),
  } satisfies CameraSnapshot);

  // Store callbacks in a ref to avoid re-binding listeners on every render
  const callbacksRef = useRef(callbacks);
  useLayoutEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  const sync = useCallback(() => {
    setCamera(readCameraSnapshot(cameraRef.current));
  }, []);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const panPointer = panPointerRef.current;
    const cameraModel = cameraRef.current;

    const pointerCallbacks = {
      onPan: (delta: ContainerDelta) => {
        cameraModel.panBy(delta);
        sync();
      },
      onZoom: (deltaY) => {
        applyWheelDeltaYToCamera(cameraModel, deltaY);
        sync();
      },
      onHover: (point) => callbacksRef.current.onHover(point),
      onClick: (point) => callbacksRef.current.onClick(point),
      onRotateClockwise: () => callbacksRef.current.onRotateClockwise(),
      onRotateCounterClockwise: () => callbacksRef.current.onRotateCounterClockwise(),
      onLeave: () => callbacksRef.current.onLeave(),
    } satisfies PointerInteractionCallbacks;

    const cleanup = bindPointerInteraction(container, pointerCallbacks, panPointer);

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
  ) satisfies ContainerToWorldFn;

  return { camera, resetCamera, containerToWorld };
}

function readCameraSnapshot(camera: Camera): CameraSnapshot {
  return {
    position: camera.pan,
    zoom: camera.zoom,
    rotation: camera.rotation,
  } satisfies CameraSnapshot;
}
