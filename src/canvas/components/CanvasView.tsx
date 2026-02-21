import React, { useRef, useEffect } from 'react';
import { CanvasController } from '../engine/CanvasController';
import { ResetViewButton } from './ResetViewButton';
import { Session } from '../../models/Session';

interface CanvasViewProps {
  session: Session;
}

export const CanvasView: React.FC<CanvasViewProps> = ({ session }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controllerRef = useRef<CanvasController | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initialize Controller
    const controller = new CanvasController(canvas, session);
    controllerRef.current = controller;

    // Cleanup on unmount
    return () => {
      controller.destroy();
      controllerRef.current = null;
    };
  }, [session]);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
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
