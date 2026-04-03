import { type FC, useMemo, useRef } from 'react';
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

  const tiles = useMemo(() => boardToSvgTiles(activeGame.board), [activeGame.board]);

  const camera = useMemo(
    () => ({
      x: transform.x,
      y: transform.y,
      zoom: transform.zoom,
    }),
    [transform.x, transform.y, transform.zoom]
  );

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
      <SvgBoard tiles={tiles} camera={camera} />
    </div>
  );
};
