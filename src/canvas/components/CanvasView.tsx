import { useRef, useEffect, useState } from 'react';
import { CanvasController } from '../engine/CanvasController';
import { ResetViewButton } from './ResetViewButton';
import { GameHUD } from './GameHUD';
import { DebugOverlay } from './DebugOverlay';
import { Session } from '../../models/Session';
import type { Tile } from '../../models/Tile';

interface CanvasViewProps {
  session: Session;
  /** Called when a tile is placed; e.g. parent may debounce and persist game state. */
  onTilePlaced: () => void;
}

export const CanvasView: React.FC<CanvasViewProps> = ({ session, onTilePlaced }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controllerRef = useRef<CanvasController | null>(null);
  const activeGame = session.activeGame;

  if (!activeGame) {
    throw new Error('CanvasView requires an active game in the session.');
  }

  // State for game stats to ensure React updates when they change
  const [score, setScore] = useState(activeGame.score);
  const [remainingTurns, setRemainingTurns] = useState(activeGame.remainingTurns);
  const [nextTile, setNextTile] = useState<Tile | null>(activeGame.peek() ?? null);
  const [controller, setController] = useState<CanvasController | null>(null);
  const [debugOverlayVisible, setDebugOverlayVisible] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const newController = new CanvasController(canvas, session, {
      onToggleDebugOverlay: () => setDebugOverlayVisible((v) => !v),
    });
    setController(newController);

    newController.onStatsChange = (newScore: number, newTurns: number, newNextTile: Tile | null) => {
      setScore(newScore);
      setRemainingTurns(newTurns);
      setNextTile(newNextTile);
    };

    newController.onTilePlaced = onTilePlaced;

    controllerRef.current = newController;

    return () => {
      newController.destroy();
      controllerRef.current = null;
      setController(null);
    };
  }, [session, activeGame, onTilePlaced]);

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
