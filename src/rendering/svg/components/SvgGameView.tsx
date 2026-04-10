import { type FC, useLayoutEffect, useRef } from 'react';
import { radians } from '../../../utils/Angle';
import { ContainerPoint } from '../../common/ContainerPoint';
import { rotateCameraSnapshotBy } from '../../common/camera/cameraTransforms';
import { SvgBoard } from './SvgBoard';
import { Game } from '../../../models/Game';
import { GameHUD } from '../../shell/GameHUD';
import { ResetViewButton } from '../../shell/ResetViewButton';
import { useSvgBoardInteraction } from '../hooks/useSvgBoardInteraction';
import { useSvgBoardPointerCamera } from '../hooks/useSvgBoardPointerCamera';
import { useSvgGameViewLayout } from '../hooks/useSvgGameViewLayout';
import { useSvgWindowInput } from '../hooks/useSvgWindowInput';
import {
  SVG_CAMERA_KEYBOARD_ROTATION_RADIANS_PER_FRAME,
  applySvgWorldTransformToGroup,
} from '../svgBoardWorldTransform';
import { useGameSnapshotBridge } from '../../common/bridge/useGameSnapshotBridge';

interface SvgGameViewProps {
  activeGame: Game;
  setActiveGame: (game: Game) => void;
}

export const SvgGameView: FC<SvgGameViewProps> = ({ activeGame, setActiveGame }) => {
  const { getGameSnapshot, setGameSnapshot } = useGameSnapshotBridge(activeGame, setActiveGame);
  const containerRef = useRef<HTMLDivElement>(null);

  const { cameraPointerCallbacks, containerToWorldRef } = useSvgBoardInteraction(
    getGameSnapshot,
    setGameSnapshot
  );

  const { viewSize, measureContainer } = useSvgGameViewLayout(containerRef);

  const { getRotationDirection } = useSvgWindowInput({
    onRotateClockwise: cameraPointerCallbacks.onRotateClockwise,
    onRotateCounterClockwise: cameraPointerCallbacks.onRotateCounterClockwise,
    onResize: measureContainer,
  });

  const getRotationDirectionRef = useRef(getRotationDirection);
  useLayoutEffect(() => {
    getRotationDirectionRef.current = getRotationDirection;
  }, [getRotationDirection]);

  const { camera, cameraRef, syncCameraToReact, resetCamera, containerToWorld } =
    useSvgBoardPointerCamera(containerRef, cameraPointerCallbacks);

  const syncCameraToReactRef = useRef(syncCameraToReact);
  useLayoutEffect(() => {
    syncCameraToReactRef.current = syncCameraToReact;
  }, [syncCameraToReact]);

  useLayoutEffect(() => {
    containerToWorldRef.current = containerToWorld;
  }, [containerToWorld, containerToWorldRef]);

  const viewCenter: ContainerPoint = ContainerPoint.xy(viewSize.width / 2, viewSize.height / 2);

  const viewCenterRef = useRef(viewCenter);
  useLayoutEffect(() => {
    viewCenterRef.current = viewCenter;
  }, [viewCenter]);

  const worldGroupRef = useRef<SVGGElement>(null);

  useLayoutEffect(() => {
    applySvgWorldTransformToGroup(worldGroupRef.current, cameraRef.current, viewCenter);
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
        applySvgWorldTransformToGroup(group, cameraRef.current, viewCenterRef.current);
      }

      if (prevDir !== 0 && dir === 0) {
        syncCameraToReactRef.current();
      }

      prevDir = dir;
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [cameraRef, worldGroupRef, viewCenterRef]);

  return (
    <div
      ref={containerRef}
      data-testid="game-svg"
      role="img"
      aria-label="Game Board"
      style={{ position: 'relative', width: '100vw', height: '100vh', touchAction: 'none' }}
    >
      <GameHUD
        score={activeGame.score}
        remainingTurns={activeGame.remainingTurns}
        nextTile={activeGame.peek() ?? null}
      />
      <ResetViewButton onClick={() => resetCamera()} />
      <SvgBoard
        ref={worldGroupRef}
        board={activeGame.board}
        camera={camera}
        viewCenter={viewCenter}
        deferWorldTransformToParent
      />
    </div>
  );
};
