import { useRef, useEffect, useState } from 'react';
import { CanvasController } from '../engine/CanvasController';
import { ResetViewButton } from './ResetViewButton';
import { GameHUD } from './GameHUD';
import { DebugOverlay } from './DebugOverlay';
import { Session } from '../../models/Session';
import type { Tile } from '../../models/Tile';

interface CanvasViewProps {
  session: Session;
}

export const CanvasView: React.FC<CanvasViewProps> = ({ session }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controllerRef = useRef<CanvasController | null>(null);
  const activeGame = session.activeGame;

  // CRITICAL: Ensure an active game is always present.
  if (!activeGame) {
    throw new Error('CanvasView requires an active game in the session.');
  }

  // State for game stats to ensure React updates when they change
  const [score, setScore] = useState(activeGame.score ?? 0);
  const [remainingTurns, setRemainingTurns] = useState(activeGame.remainingTurns ?? 0);
  const [nextTile, setNextTile] = useState<Tile | null>(activeGame.peek() ?? null);
  const [controller, setController] = useState<CanvasController | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initialize Controller (activeGame is guaranteed to exist here)
    const newController = new CanvasController(canvas, session);
    setController(newController);

    // Sync stats when the game state changes
    newController.onStatsChange = (newScore: number, newTurns: number, newNextTile: Tile | null) => {
      setScore(newScore);
      setRemainingTurns(newTurns);
      setNextTile(newNextTile);
    };

    controllerRef.current = newController;

    // Cleanup on unmount
    return () => {
      newController.destroy();
      controllerRef.current = null;
      setController(null);
    };
  }, [session, activeGame]); // Depend on activeGame to re-init if a new game starts

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <GameHUD score={score} remainingTurns={remainingTurns} nextTile={nextTile} />
      <ResetViewButton onClick={() => controllerRef.current?.resetCamera()} />
      {controller && <DebugOverlay controller={controller} />}
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
