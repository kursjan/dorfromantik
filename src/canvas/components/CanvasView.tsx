import { useRef, useEffect, useState } from 'react';
import { CanvasController } from '../engine/CanvasController';
import { ResetViewButton } from './ResetViewButton';
import { GameHUD } from './GameHUD';
import { DebugOverlay } from './DebugOverlay';
import { Game } from '../../models/Game';
import { useActiveGame } from '../../context/SessionContext';
import { useGameSnapshotBridge } from '../hooks/useGameSnapshotBridge';

interface CanvasViewProps {
  activeGame: Game;
  /** Called when a tile is placed; e.g. parent may debounce and persist game state. */
  onTilePlaced: () => void;
}

export const CanvasView: React.FC<CanvasViewProps> = ({ activeGame, onTilePlaced }) => {
  const { setActiveGame } = useActiveGame();
  const { getGameSnapshot, setGameSnapshot } = useGameSnapshotBridge(activeGame, setActiveGame);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controllerRef = useRef<CanvasController | null>(null);

  const [controller, setController] = useState<CanvasController | null>(null);
  const [debugOverlayVisible, setDebugOverlayVisible] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const newController = new CanvasController(canvas, {
      getGameSnapshot,
      setGameSnapshot,
      onToggleDebugOverlay: () => setDebugOverlayVisible((v) => !v),
    });
    setController(newController);

    newController.onTilePlaced = onTilePlaced;

    controllerRef.current = newController;

    return () => {
      newController.destroy();
      controllerRef.current = null;
      setController(null);
    };
    // Recreate controller when switching games (id), not on every immutable snapshot — latest game is read via getGameSnapshot.
  }, [activeGame.id, onTilePlaced, getGameSnapshot, setGameSnapshot]);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <GameHUD
        score={activeGame.score}
        remainingTurns={activeGame.remainingTurns}
        nextTile={activeGame.peek() ?? null}
      />
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
