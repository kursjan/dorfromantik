import { type FC, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { CameraSnapshot } from '../cameraSnapshot';
import { SvgBoard } from './SvgBoard';
import { Game } from '../../../models/Game';
import { GameHUD } from '../../shell/GameHUD';
import { ResetViewButton } from '../../shell/ResetViewButton';
import { useCameraControls } from '../hooks/useCameraControls';
import { useSvgBoardInteraction } from '../hooks/useSvgBoardInteraction';
import { useGameSnapshotBridge } from '../../common/bridge/useGameSnapshotBridge';

interface SvgGameViewProps {
  activeGame: Game;
  /** Typically `setActiveGame` from session context; reserved for Phase 2 placement parity. */
  setActiveGame: (game: Game) => void;
}

/**
 * DOM/SVG game board: composition of shell + viewport + {@link SvgBoard}; pointer → game rules live in
 * {@link useSvgBoardInteraction}, camera in {@link useCameraControls}.
 */
export const SvgGameView: FC<SvgGameViewProps> = ({ activeGame, setActiveGame }) => {
  const { getGameSnapshot, setGameSnapshot } = useGameSnapshotBridge(activeGame, setActiveGame);
  const containerRef = useRef<HTMLDivElement>(null);

  const { cameraPointerCallbacks, screenToWorldRef } = useSvgBoardInteraction(
    getGameSnapshot,
    setGameSnapshot
  );

  const { transform, resetCamera, screenToWorld } = useCameraControls(
    containerRef,
    cameraPointerCallbacks
  );

  useLayoutEffect(() => {
    screenToWorldRef.current = screenToWorld;
  }, [screenToWorld, screenToWorldRef]);

  const [viewSize, setViewSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const r = el.getBoundingClientRect();
      let w = r.width;
      let h = r.height;
      if (w === 0 && h === 0 && typeof window !== 'undefined') {
        w = window.innerWidth;
        h = window.innerHeight;
      }
      setViewSize({ width: w, height: h });
    };

    update();

    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const camera = useMemo(
    (): CameraSnapshot => ({
      x: transform.x,
      y: transform.y,
      zoom: transform.zoom,
      rotation: transform.rotation,
    }),
    [transform.x, transform.y, transform.zoom, transform.rotation]
  );

  const viewCenter = { x: viewSize.width / 2, y: viewSize.height / 2 };

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
