import { type FC, useLayoutEffect, useRef } from 'react';
import { ContainerPoint } from '../../common/ContainerPoint';
import { SvgBoard } from './SvgBoard';
import { Game } from '../../../models/Game';
import { GameHUD } from '../../shell/GameHUD';
import { ResetViewButton } from '../../shell/ResetViewButton';
import { useCameraControls } from '../hooks/useCameraControls';
import { useSvgBoardInteraction } from '../hooks/useSvgBoardInteraction';
import { useSvgGameViewLayout } from '../hooks/useSvgGameViewLayout';
import { useSvgCameraKeyboardRotationRaf } from '../hooks/useSvgCameraKeyboardRotationRaf';
import { useWindowLevelGameInput } from '../hooks/useWindowLevelGameInput';
import { applySvgWorldTransformToGroup } from '../svgBoardWorldTransform';
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

  const { getRotationDirection } = useWindowLevelGameInput({
    onRotateClockwise: cameraPointerCallbacks.onRotateClockwise,
    onRotateCounterClockwise: cameraPointerCallbacks.onRotateCounterClockwise,
    onResize: measureContainer,
  });

  const { camera, cameraRef, syncCameraToReact, resetCamera, containerToWorld } = useCameraControls(
    containerRef,
    cameraPointerCallbacks
  );

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

  useSvgCameraKeyboardRotationRaf({
    worldGroupRef,
    cameraRef,
    viewCenterRef,
    getRotationDirection,
    syncCameraToReact,
  });

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
