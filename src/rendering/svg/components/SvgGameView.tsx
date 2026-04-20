import { type FC, useLayoutEffect, useRef } from 'react';
import { SvgBoardCameraShell } from './SvgBoardCameraShell';
import { Game } from '../../../models/Game';
import { GameHUD } from '../../shell/GameHUD';
import { ResetViewButton } from '../../shell/ResetViewButton';
import { useSvgBoardInteraction } from '../hooks/useSvgBoardInteraction';
import {
  useSvgBoardPointerCamera,
  type SvgBoardPointerCameraCallbacks,
} from '../hooks/useSvgBoardPointerCamera';
import { useSvgGameViewLayout } from '../hooks/useSvgGameViewLayout';
import { useGameSnapshotBridge } from '../../common/bridge/useGameSnapshotBridge';
import { ContainerPoint } from '../../common/ContainerPoint';

interface SvgGameViewProps {
  activeGame: Game;
  setActiveGame: (game: Game) => void;
}

export const SvgGameView: FC<SvgGameViewProps> = ({ activeGame, setActiveGame }) => {
  const { getGameSnapshot, setGameSnapshot } = useGameSnapshotBridge(activeGame, setActiveGame);
  const containerRef = useRef<HTMLDivElement>(null);
  const cameraPointerCallbacksRef = useRef<SvgBoardPointerCameraCallbacks>({
    onHover: () => {},
    onClick: () => {},
    onRotateClockwise: () => {},
    onRotateCounterClockwise: () => {},
    onLeave: () => {},
  });
  const { viewSize, measureContainer } = useSvgGameViewLayout(containerRef);
  const { camera, cameraRef, syncCameraToReact, resetCamera } = useSvgBoardPointerCamera(
    containerRef,
    cameraPointerCallbacksRef
  );
  const { cameraPointerCallbacks } = useSvgBoardInteraction(getGameSnapshot, setGameSnapshot);

  useLayoutEffect(() => {
    cameraPointerCallbacksRef.current = cameraPointerCallbacks;
  }, [cameraPointerCallbacks]);

  const viewCenter: ContainerPoint = ContainerPoint.xy(viewSize.width / 2, viewSize.height / 2);

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
      <SvgBoardCameraShell
        board={activeGame.board}
        camera={camera}
        viewCenter={viewCenter}
        cameraSnapshotRef={cameraRef}
        syncCameraToReact={syncCameraToReact}
        windowInputCallbacks={{
          onRotateClockwise: cameraPointerCallbacks.onRotateClockwise,
          onRotateCounterClockwise: cameraPointerCallbacks.onRotateCounterClockwise,
          onResize: measureContainer,
        }}
      />
    </div>
  );
};
