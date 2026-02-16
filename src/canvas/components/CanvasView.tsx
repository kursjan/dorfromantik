import React, { useRef, useEffect } from 'react';
import { CanvasController } from '../engine/CanvasController';

export const CanvasView: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controllerRef = useRef<CanvasController | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initialize Controller
    const controller = new CanvasController(canvas);
    controllerRef.current = controller;

    // Cleanup on unmount
    return () => {
      controller.destroy();
      controllerRef.current = null;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', width: '100vw', height: '100vh', touchAction: 'none' }}
      data-testid="game-canvas"
      aria-label="Game Board"
      role="img"
    />
  );
};
