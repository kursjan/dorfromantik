import { type FC, useLayoutEffect, useRef } from 'react';
import { SvgBoardCameraShell } from './SvgBoardCameraShell';
import { Game } from '../../../models/Game';
import { GameHUD } from '../../shell/GameHUD';
import { ResetViewButton } from '../../shell/ResetViewButton';
import { useSvgBoardInteraction } from '../hooks/useSvgBoardInteraction';
import { useSvgBoardPointerCamera } from '../hooks/useSvgBoardPointerCamera';
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

  const { cameraPointerCallbacks, containerToWorldRef } = useSvgBoardInteraction(
    getGameSnapshot,
    setGameSnapshot
  );

  const { viewSize, measureContainer } = useSvgGameViewLayout(containerRef);

  const { camera, cameraRef, syncCameraToReact, resetCamera, containerToWorld } =
    useSvgBoardPointerCamera(containerRef, cameraPointerCallbacks);

  useLayoutEffect(() => {
    containerToWorldRef.current = containerToWorld;
  }, [containerToWorld, containerToWorldRef]);

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
