import { type FC, useCallback, useLayoutEffect, useRef, useState } from 'react';
import { ContainerPoint } from '../../common/ContainerPoint';
import { SvgBoard } from './SvgBoard';
import { Game } from '../../../models/Game';
import { GameHUD } from '../../shell/GameHUD';
import { ResetViewButton } from '../../shell/ResetViewButton';
import { useCameraControls } from '../hooks/useCameraControls';
import { useSvgBoardInteraction } from '../hooks/useSvgBoardInteraction';
import { useWindowLevelGameInput } from '../hooks/useWindowLevelGameInput';
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

  const [viewSize, setViewSize] = useState({ width: 0, height: 0 });

  const measureContainer = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    let w = r.width;
    let h = r.height;
    if (w === 0 && h === 0 && typeof window !== 'undefined') {
      w = window.innerWidth;
      h = window.innerHeight;
    }
    setViewSize({ width: w, height: h });
  }, []);

  useWindowLevelGameInput({
    onRotateClockwise: cameraPointerCallbacks.onRotateClockwise,
    onRotateCounterClockwise: cameraPointerCallbacks.onRotateCounterClockwise,
    onResize: measureContainer,
  });

  const { camera, resetCamera, containerToWorld } = useCameraControls(
    containerRef,
    cameraPointerCallbacks
  );

  useLayoutEffect(() => {
    containerToWorldRef.current = containerToWorld;
  }, [containerToWorld, containerToWorldRef]);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const frame = requestAnimationFrame(() => {
      measureContainer();
    });

    if (typeof ResizeObserver === 'undefined') {
      return () => cancelAnimationFrame(frame);
    }

    const ro = new ResizeObserver(() => measureContainer());
    ro.observe(el);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
    };
  }, [measureContainer]);

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
      <SvgBoard board={activeGame.board} camera={camera} viewCenter={viewCenter} />
    </div>
  );
};
