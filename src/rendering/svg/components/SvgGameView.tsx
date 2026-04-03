import { type FC, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { SvgBoard, type Camera } from '../board/SvgBoard';
import { Game } from '../../../models/Game';
import { HexCoordinate } from '../../../models/HexCoordinate';
import { GameHUD } from '../../shell/GameHUD';
import { ResetViewButton } from '../../shell/ResetViewButton';
import { useCameraControls } from '../hooks/useCameraControls';
import { useGameSnapshotBridge } from '../../common/bridge/useGameSnapshotBridge';
import { distanceToHex } from '../../common/hex/HexUtils';
import { HEX_SIZE } from '../../common/hex/hexLayout';

interface SvgGameViewProps {
  activeGame: Game;
  /** Typically `setActiveGame` from session context; reserved for Phase 2 placement parity. */
  setActiveGame: (game: Game) => void;
}

function findClosestHexCoordinate(
  validCoords: HexCoordinate[],
  x: number,
  y: number
): HexCoordinate {
  return validCoords
    .map((coord) => ({ coord, dist: distanceToHex(coord, x, y, HEX_SIZE) }))
    .sort((a, b) => a.dist - b.dist)[0].coord;
}

/**
 * DOM/SVG game board: renders `activeGame.board` with {@link SvgBoard} and shared pan/zoom via
 * {@link useCameraControls}. Placement and keyboard parity follow in later track tasks.
 */
export const SvgGameView: FC<SvgGameViewProps> = ({ activeGame, setActiveGame }) => {
  const { getGameSnapshot, setGameSnapshot } = useGameSnapshotBridge(activeGame, setActiveGame);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredHex, setHoveredHex] = useState<HexCoordinate | null>(null);
  const screenToWorldRef = useRef<((x: number, y: number) => { x: number; y: number }) | undefined>(
    undefined
  );

  const { transform, resetCamera, screenToWorld } = useCameraControls(containerRef, {
    onHover: (mouseX, mouseY) => {
      if (!screenToWorldRef.current) return;
      const worldPos = screenToWorldRef.current(mouseX, mouseY);
      const validCoords = getGameSnapshot().hints.validPlacements;

      if (validCoords.length === 0) {
        setHoveredHex(null);
        return;
      }

      const closest = findClosestHexCoordinate([...validCoords], worldPos.x, worldPos.y);
      setHoveredHex(closest);
    },
    onLeave: () => {
      setHoveredHex(null);
    },
    onClick: (_mouseX, _mouseY) => {
      const game = getGameSnapshot();
      if (!game.inProgress()) return;
      if (!hoveredHex) return;
      if (!game.isValidPlacement(hoveredHex)) return;

      const { game: nextGame } = game.placeTile(hoveredHex);
      setGameSnapshot(nextGame);
    },
    onRotateClockwise: () => {
      const nextGame = getGameSnapshot().rotateQueuedTileClockwise();
      setGameSnapshot(nextGame);
    },
    onRotateCounterClockwise: () => {
      const nextGame = getGameSnapshot().rotateQueuedTileCounterClockwise();
      setGameSnapshot(nextGame);
    },
  });

  useLayoutEffect(() => {
    screenToWorldRef.current = screenToWorld;
  }, [screenToWorld]);

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
    (): Camera => ({
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
