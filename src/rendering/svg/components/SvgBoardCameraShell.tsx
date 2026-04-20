import { type FC, type RefObject, useLayoutEffect, useRef } from 'react';
import { radians, radiansToDegrees } from '../../../utils/Angle';
import { Board } from '../../../models/Board';
import type { ContainerPoint } from '../../common/ContainerPoint';
import type { CameraSnapshot } from '../../common/camera/CameraSnapshot';
import { rotateCameraSnapshotBy } from '../../common/camera/cameraTransforms';
import { SvgBoard } from './SvgBoard';
import { useSvgWindowInput, type SvgWindowInputCallbacks } from '../hooks/useSvgWindowInput';

/** Keep in sync with `CanvasController.ROTATION_SPEED`. */
const SVG_CAMERA_KEYBOARD_ROTATION_RADIANS_PER_FRAME = 0.05;

export interface SvgBoardCameraShellProps {
  board: Board;
  camera: CameraSnapshot;
  viewCenter: ContainerPoint;
  cameraSnapshotRef: RefObject<CameraSnapshot>;
  syncCameraToReact: () => void;
  windowInputCallbacks: SvgWindowInputCallbacks;
}

export const SvgBoardCameraShell: FC<SvgBoardCameraShellProps> = ({
  board,
  camera,
  viewCenter,
  cameraSnapshotRef: cameraSnapshotRef,
  syncCameraToReact,
  windowInputCallbacks,
}) => {
  const { getRotationDirection } = useSvgWindowInput(windowInputCallbacks);

  const getRotationDirectionRef = useRef(getRotationDirection);
  useLayoutEffect(() => {
    getRotationDirectionRef.current = getRotationDirection;
  }, [getRotationDirection]);

  const syncCameraToReactRef = useRef(syncCameraToReact);
  useLayoutEffect(() => {
    syncCameraToReactRef.current = syncCameraToReact;
  }, [syncCameraToReact]);

  const viewCenterRef = useRef(viewCenter);
  useLayoutEffect(() => {
    viewCenterRef.current = viewCenter;
  }, [viewCenter]);

  const worldTransformGroupRef = useRef<SVGGElement>(null);

  useLayoutEffect(() => {
    const worldTransformGroup = worldTransformGroupRef.current;
    if (!worldTransformGroup) return;
    const cameraSnapshot = cameraSnapshotRef.current;
    worldTransformGroup.setAttribute(
      'transform',
      `translate(${viewCenter.x}, ${viewCenter.y}) rotate(${radiansToDegrees(cameraSnapshot.rotation)}) scale(${cameraSnapshot.zoom}) translate(${cameraSnapshot.position.x}, ${cameraSnapshot.position.y})`
    );
  }, [camera, viewCenter, cameraSnapshotRef]);

  useLayoutEffect(() => {
    let rafId = 0;
    let previousDirection = 0;

    const loop = () => {
      const direction = getRotationDirectionRef.current();
      const worldTransformGroup = worldTransformGroupRef.current;

      if (previousDirection !== 0 && direction === 0) {
        syncCameraToReactRef.current();
      }

      if (direction === 0 || worldTransformGroup == null) {
        previousDirection = direction;
        rafId = requestAnimationFrame(loop);
        return;
      }

      cameraSnapshotRef.current = rotateCameraSnapshotBy(
        cameraSnapshotRef.current,
        radians(direction * SVG_CAMERA_KEYBOARD_ROTATION_RADIANS_PER_FRAME)
      );
      const cameraSnapshot = cameraSnapshotRef.current;
      const currentViewCenter = viewCenterRef.current;
      worldTransformGroup.setAttribute(
        'transform',
        `translate(${currentViewCenter.x}, ${currentViewCenter.y}) rotate(${radiansToDegrees(cameraSnapshot.rotation)}) scale(${cameraSnapshot.zoom}) translate(${cameraSnapshot.position.x}, ${cameraSnapshot.position.y})`
      );

      previousDirection = direction;
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [cameraSnapshotRef]);

  return <SvgBoard ref={worldTransformGroupRef} board={board} />;
};
