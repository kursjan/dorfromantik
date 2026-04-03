import { type FC, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { SvgBoard, type SvgBoardTile } from '../../components/Tiles/SvgBoard';
import { Board } from '../../models/Board';
import { Game } from '../../models/Game';
import { GameHUD } from './GameHUD';
import { ResetViewButton } from './ResetViewButton';
import { useCameraControls } from '../hooks/useCameraControls';

interface SvgGameViewProps {
  activeGame: Game;
  /** Typically `setActiveGame` from session context; reserved for Phase 2 placement parity. */
  setActiveGame: (game: Game) => void;
}

function boardToSvgTiles(board: Board): SvgBoardTile[] {
  return Array.from(board.getAll(), (bt) => ({
    id: bt.id,
    tile: bt.tile,
    coordinate: bt.coordinate,
  }));
}

/**
 * DOM/SVG game board: renders `activeGame.board` with {@link SvgBoard} and shared pan/zoom via
 * {@link useCameraControls}. Placement and keyboard parity follow in later track tasks.
 */
export const SvgGameView: FC<SvgGameViewProps> = ({
  activeGame,
  setActiveGame: _setActiveGame,
}) => {
  // Reserved for Phase 2 (placement / snapshot bridge); must match CanvasView props.
  void _setActiveGame;
  const containerRef = useRef<HTMLDivElement>(null);
  const { transform, resetCamera } = useCameraControls(containerRef);

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

  const tiles = useMemo(() => boardToSvgTiles(activeGame.board), [activeGame.board]);

  const camera = useMemo(
    () => ({
      x: transform.x,
      y: transform.y,
      zoom: transform.zoom,
      rotation: transform.rotation,
    }),
    [transform.x, transform.y, transform.zoom, transform.rotation]
  );

  const viewCenter =
    viewSize.width > 0 && viewSize.height > 0
      ? { x: viewSize.width / 2, y: viewSize.height / 2 }
      : undefined;

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
      <SvgBoard tiles={tiles} camera={camera} viewCenter={viewCenter} />
    </div>
  );
};
