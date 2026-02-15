import React, { useRef, useEffect } from 'react';
import { hexToPixel, HEX_SIZE } from '../utils/HexUtils';
import { HexCoordinate } from '../models/HexCoordinate';

export const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Camera state (stored in refs for performance in the render loop)
  const cameraRef = useRef({ x: 0, y: 0, zoom: 1 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const drawHex = (ctx: CanvasRenderingContext2D, hex: HexCoordinate) => {
      const { x, y } = hexToPixel(hex.q, hex.r, HEX_SIZE);
      
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (2 * Math.PI) / 6 * i;
        const hx = x + HEX_SIZE * Math.cos(angle);
        const hy = y + HEX_SIZE * Math.sin(angle);
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.stroke();
      
      // Render Cubic Coordinates (q, r, s)
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '10px Arial'; // Explicit font size
      ctx.fillText(`${hex.q},${hex.r},${hex.s}`, x, y);
    };

    const render = () => {
      // Resize canvas to fill parent
      if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }

      // Clear canvas
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Save context state before camera transform
      ctx.save();

      // Camera Transform:
      // 1. Translate to center of screen
      ctx.translate(canvas.width / 2, canvas.height / 2);
      // 2. Apply Zoom
      ctx.scale(cameraRef.current.zoom, cameraRef.current.zoom);
      // 3. Translate by Camera Position (pan)
      ctx.translate(cameraRef.current.x, cameraRef.current.y);

      // Draw Debug Grid (Spiral or simple range)
      ctx.strokeStyle = '#ccc';
      ctx.fillStyle = '#666';
      
      const radius = 3; // Draw a 5-hex radius grid
      for (let q = -radius; q <= radius; q++) {
        const r1 = Math.max(-radius, -q - radius);
        const r2 = Math.min(radius, -q + radius);
        for (let r = r1; r <= r2; r++) {
          const s = -q - r;
          const hex = new HexCoordinate(q, r, s);
          drawHex(ctx, hex);
        }
      }

      // Draw Center Hex Distinctly
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      drawHex(ctx, new HexCoordinate(0, 0, 0));
      
      // Restore context to remove camera transform for UI overlay (if any)
      ctx.restore();

      // Simple debug UI
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = 'black';
      ctx.font = '20px Arial';
      ctx.fillText('Camera Active: (0,0)', 20, 30);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
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
