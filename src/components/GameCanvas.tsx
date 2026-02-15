import React, { useRef, useEffect } from 'react';

export const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Simple clear to verify it works
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText('Game Canvas Ready', 50, 50);

  }, []);

  return (
    <canvas 
        ref={canvasRef} 
        width={800} 
        height={600} 
        style={{ border: '1px solid black' }}
        data-testid="game-canvas"
        aria-label="Game Board"
        role="img"
    />
  );
};
