import { type MutableRefObject, type RefObject, useLayoutEffect, useRef } from 'react';
import type { ContainerPoint } from '../../common/ContainerPoint';
import type { CameraSnapshot } from '../../common/camera/CameraSnapshot';
import { radians } from '../../../utils/Angle';
import { rotateCameraSnapshotBy } from '../../common/camera/cameraTransforms';
import {
  SVG_CAMERA_KEYBOARD_ROTATION_RADIANS_PER_FRAME,
  applySvgWorldTransformToGroup,
} from '../svgBoardWorldTransform';

export function useSvgCameraRotationRaf(options: {
  worldGroupRef: RefObject<SVGGElement | null>;
  cameraRef: MutableRefObject<CameraSnapshot>;
  viewCenterRef: RefObject<ContainerPoint>;
  getRotationDirection: () => number;
  syncCameraToReact: () => void;
}): void {
  const { worldGroupRef, cameraRef, viewCenterRef, getRotationDirection, syncCameraToReact } =
    options;

  const getRotationDirectionRef = useRef(getRotationDirection);
  useLayoutEffect(() => {
    getRotationDirectionRef.current = getRotationDirection;
  }, [getRotationDirection]);

  const syncRef = useRef(syncCameraToReact);
  useLayoutEffect(() => {
    syncRef.current = syncCameraToReact;
  }, [syncCameraToReact]);

  useLayoutEffect(() => {
    let rafId = 0;
    let prevDir = 0;

    const loop = () => {
      const dir = getRotationDirectionRef.current();
      const group = worldGroupRef.current;

      if (dir !== 0 && Number.isFinite(dir) && group) {
        cameraRef.current = rotateCameraSnapshotBy(
          cameraRef.current,
          radians(dir * SVG_CAMERA_KEYBOARD_ROTATION_RADIANS_PER_FRAME)
        );
        applySvgWorldTransformToGroup(group, cameraRef.current, viewCenterRef.current);
      }

      if (prevDir !== 0 && dir === 0) {
        syncRef.current();
      }

      prevDir = dir;
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [cameraRef, worldGroupRef, viewCenterRef]);
}
