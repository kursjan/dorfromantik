import { useRef, useEffect, useState } from 'react';
import { CanvasController } from '../engine/CanvasController';
import { ResetViewButton } from './ResetViewButton';
import { GameHUD } from './GameHUD';
import { DebugOverlay } from './DebugOverlay';
import { Game } from '../../models/Game';
import type { Tile } from '../../models/Tile';
import { useActiveGame } from '../../context/SessionContext';

interface CanvasViewProps {
  activeGame: Game;
  /** Called when a tile is placed; e.g. parent may debounce and persist game state. */
  onTilePlaced: () => void;
}

export const CanvasView: React.FC<CanvasViewProps> = ({ activeGame, onTilePlaced }) => {
  const { setActiveGame } = useActiveGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controllerRef = useRef<CanvasController | null>(null);

  // State for game stats to ensure React updates when they change
  const [score, setScore] = useState(activeGame.score);
  const [remainingTurns, setRemainingTurns] = useState(activeGame.remainingTurns);
  const [nextTile, setNextTile] = useState<Tile | null>(activeGame.peek() ?? null);
  const [controller, setController] = useState<CanvasController | null>(null);
  const [debugOverlayVisible, setDebugOverlayVisible] = useState(false);

  useEffect(() => {
    setScore(activeGame.score);
    setRemainingTurns(activeGame.remainingTurns);
    setNextTile(activeGame.peek() ?? null);
    // Sync HUD from props only when switching games; in-session updates come from onStatsChange.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: do not reset HUD on every immutable snapshot
  }, [activeGame.id]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const newController = new CanvasController(canvas, activeGame, {
      onToggleDebugOverlay: () => setDebugOverlayVisible((v) => !v),
      onActiveGameChange: setActiveGame,
    });
    setController(newController);

    newController.onStatsChange = (
      newScore: number,
      newTurns: number,
      newNextTile: Tile | null
    ) => {
      setScore(newScore);
      setRemainingTurns(newTurns);
      setNextTile(newNextTile);
    };

    newController.onTilePlaced = onTilePlaced;

    controllerRef.current = newController;

    // Unsubscribe function
    return () => {
      newController.destroy();
      controllerRef.current = null;
      setController(null);
    };
    // Recreate controller only when switching games (id), not on every immutable snapshot of the same session.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- activeGame identity updates every move; controller applies snapshots via onActiveGameChange
  }, [activeGame.id, onTilePlaced, setActiveGame]);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <GameHUD score={score} remainingTurns={remainingTurns} nextTile={nextTile} />
      <ResetViewButton onClick={() => controllerRef.current?.resetCamera()} />
      {controller && <DebugOverlay controller={controller} isVisible={debugOverlayVisible} />}
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none' }}
        data-testid="game-canvas"
        aria-label="Game Board"
        role="img"
      />
    </div>
  );
};
