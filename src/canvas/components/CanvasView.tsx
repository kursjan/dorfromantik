import React, { useRef, useEffect, useState } from 'react';
import { CanvasController } from '../engine/CanvasController';
import { ResetViewButton } from './ResetViewButton';
import { GameHUD } from './GameHUD';
import { Session } from '../../models/Session';

interface CanvasViewProps {
  session: Session;
}

export const CanvasView: React.FC<CanvasViewProps> = ({ session }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controllerRef = useRef<CanvasController | null>(null);

  // State for game stats to ensure React updates when they change
  const [score, setScore] = useState(session.activeGame?.score ?? 0);
  const [remainingTurns, setRemainingTurns] = useState(session.activeGame?.remainingTurns ?? 0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initialize Controller
    const controller = new CanvasController(canvas, session);

    // Sync stats when the game state changes
    controller.onStatsChange = (newScore: number, newTurns: number) => {
      setScore(newScore);
      setRemainingTurns(newTurns);
    };

    controllerRef.current = controller;

    // Cleanup on unmount
    return () => {
      controller.destroy();
      controllerRef.current = null;
    };
  }, [session]);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <GameHUD score={score} remainingTurns={remainingTurns} />
      <ResetViewButton onClick={() => controllerRef.current?.resetCamera()} />
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
