import { useRef, useEffect, useState, useCallback } from 'react';
import { CanvasController } from '../engine/CanvasController';
import { ResetViewButton } from './ResetViewButton';
import { GameHUD } from './GameHUD';
import { DebugOverlay } from './DebugOverlay';
import { Session } from '../../models/Session';
import { useFirestoreService } from '../../services/hooks/useServices';
import type { Tile } from '../../models/Tile';

interface CanvasViewProps {
  session: Session;
}

export const CanvasView: React.FC<CanvasViewProps> = ({ session }) => {
  const firestoreService = useFirestoreService();
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
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      if (!activeGame) return;
      firestoreService.saveGameState(session.user.id, activeGame).catch((err) =>
        console.error('Failed to save game state', err)
      );
    }, 2000);
  }, [session, activeGame, firestoreService]);

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

    newController.onTilePlaced = debouncedSave;

    controllerRef.current = newController;

    return () => {
      newController.destroy();
      controllerRef.current = null;
      setController(null);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [session, activeGame, debouncedSave]);

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
