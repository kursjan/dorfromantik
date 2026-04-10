import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import type { ContainerDelta, ContainerPoint } from '../../common/ContainerPoint';
import { WORLD_ORIGIN, type WorldPoint } from '../../common/WorldPoint';
import { DEFAULT_CAMERA_SNAPSHOT, type CameraSnapshot } from '../../common/camera/CameraSnapshot';
import {
  PointerPanZoomSession,
  applyWheelDeltaYToCamera,
  bindPointerInteraction,
  type PointerInteractionCallbacks,
} from '../../common/camera/cameraInteraction';
import { cameraContainerToWorld, panCameraSnapshotBy } from '../../common/camera/cameraTransforms';

export type ContainerToWorldFn = (point: ContainerPoint) => WorldPoint;

export interface SvgBoardPointerCameraCallbacks {
  onHover: (point: ContainerPoint) => void;
  onClick: (point: ContainerPoint) => void;
  onRotateClockwise: () => void;
  onRotateCounterClockwise: () => void;
  onLeave: () => void;
}

export function useSvgBoardPointerCamera(
  containerRef: RefObject<HTMLElement | null>,
  callbacks: SvgBoardPointerCameraCallbacks
): {
  camera: CameraSnapshot;
  cameraRef: RefObject<CameraSnapshot>;
  syncCameraToReact: () => void;
  resetCamera: () => void;
  containerToWorld: ContainerToWorldFn;
} {
  const cameraRef = useRef<CameraSnapshot>({ ...DEFAULT_CAMERA_SNAPSHOT });
  const panPointerRef = useRef(new PointerPanZoomSession());
  const [camera, setCamera] = useState<CameraSnapshot>({ ...DEFAULT_CAMERA_SNAPSHOT });

  const callbacksRef = useRef(callbacks);
  useLayoutEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  const sync = useCallback(() => {
    setCamera({ ...cameraRef.current });
  }, []);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const panPointer = panPointerRef.current;
    const pointerCallbacks = {
      onPan: (delta: ContainerDelta) => {
        cameraRef.current = panCameraSnapshotBy(cameraRef.current, delta);
        sync();
      },
      onZoom: (deltaY) => {
        cameraRef.current = applyWheelDeltaYToCamera(cameraRef.current, deltaY);
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
    cameraRef.current = { ...DEFAULT_CAMERA_SNAPSHOT };
    sync();
  }, [sync]);

  const containerToWorld = useCallback(
    (point: ContainerPoint) => {
      const container = containerRef.current;
      if (!container) return WORLD_ORIGIN;
      const rect = container.getBoundingClientRect();
      return cameraContainerToWorld(cameraRef.current, point, rect.width, rect.height);
    },
    [containerRef]
  ) satisfies ContainerToWorldFn;

  return { camera, cameraRef, syncCameraToReact: sync, resetCamera, containerToWorld };
}
