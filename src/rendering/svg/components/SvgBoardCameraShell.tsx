import { type FC, type MutableRefObject, useLayoutEffect, useRef } from 'react';
import { radians } from '../../../utils/Angle';
import { Board } from '../../../models/Board';
import type { ContainerPoint } from '../../common/ContainerPoint';
import type { CameraSnapshot } from '../../common/camera/CameraSnapshot';
import { rotateCameraSnapshotBy } from '../../common/camera/cameraTransforms';
import { SvgBoard } from './SvgBoard';
import {
  SVG_CAMERA_KEYBOARD_ROTATION_RADIANS_PER_FRAME,
  buildSvgWorldTransformString,
} from '../svgBoardWorldTransform';

export interface SvgBoardCameraShellProps {
  board: Board;
  camera: CameraSnapshot;
  viewCenter: ContainerPoint;
  /**
   * From `useSvgBoardPointerCamera` in the game. When omitted, an internal ref is kept in sync
   * with the `camera` prop (Storybook / declarative demos).
   */
  cameraRef?: MutableRefObject<CameraSnapshot>;
  /** When Q/E release after rotating; no-op by default. */
  syncCameraToReact?: () => void;
  /** Held Q/E → -1 / 0 / +1; default no keyboard orbit. */
  getRotationDirection?: () => number;
}

/**
 * Owns the world `<g>` camera transform: React-driven updates from `camera` / `cameraRef`, plus an
 * rAF loop for continuous Q/E rotation without `setState` per frame. Composes {@link SvgBoard}
 * (tiles only; world `transform` is set here via `setAttribute`).
 */
export const SvgBoardCameraShell: FC<SvgBoardCameraShellProps> = ({
  board,
  camera,
  viewCenter,
  cameraRef: cameraRefProp,
  syncCameraToReact = () => {},
  getRotationDirection: getRotationDirectionProp,
}) => {
  const fallbackCameraRef = useRef<CameraSnapshot>(camera);
  useLayoutEffect(() => {
    if (!cameraRefProp) {
      fallbackCameraRef.current = camera;
    }
  }, [camera, cameraRefProp]);

  const cameraRef = cameraRefProp ?? fallbackCameraRef;

  const getRotationDirectionRef = useRef(getRotationDirectionProp ?? (() => 0));
  useLayoutEffect(() => {
    getRotationDirectionRef.current = getRotationDirectionProp ?? (() => 0);
  }, [getRotationDirectionProp]);

  const syncCameraToReactRef = useRef(syncCameraToReact);
  useLayoutEffect(() => {
    syncCameraToReactRef.current = syncCameraToReact;
  }, [syncCameraToReact]);

  const viewCenterRef = useRef(viewCenter);
  useLayoutEffect(() => {
    viewCenterRef.current = viewCenter;
  }, [viewCenter]);

  const worldGroupRef = useRef<SVGGElement>(null);

  useLayoutEffect(() => {
    const group = worldGroupRef.current;
    if (!group) return;
    group.setAttribute('transform', buildSvgWorldTransformString(cameraRef.current, viewCenter));
  }, [camera, viewCenter, cameraRef]);

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
        group.setAttribute(
          'transform',
          buildSvgWorldTransformString(cameraRef.current, viewCenterRef.current)
        );
      }

      if (prevDir !== 0 && dir === 0) {
        syncCameraToReactRef.current();
      }

      prevDir = dir;
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [cameraRef]);

  return <SvgBoard ref={worldGroupRef} board={board} />;
};
