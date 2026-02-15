import React, { useRef, useEffect } from 'react';
import { hexToPixel } from '../utils/HexUtils';
import { HexCoordinate } from '../models/HexCoordinate';
import { 
  type HexStyle, 
  GRID_HEX_STYLE, 
  CENTER_HEX_STYLE 
} from '../styles/HexStyles';

// --- Constants ---
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3.0;
const ZOOM_SENSITIVITY = 0.001;

// --- Helper Functions ---

const drawHex = (ctx: CanvasRenderingContext2D, hex: HexCoordinate, style: HexStyle) => {
  const { x, y } = hexToPixel(hex.q, hex.r, style.size);
  
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (2 * Math.PI) / 6 * i;
    const hx = x + style.size * Math.cos(angle);
    const hy = y + style.size * Math.sin(angle);
    if (i === 0) ctx.moveTo(hx, hy);
    else ctx.lineTo(hx, hy);
  }
  ctx.closePath();
  
  ctx.lineWidth = style.lineWidth;
  ctx.strokeStyle = style.strokeColor;
  ctx.stroke();
  
  if (style.fillColor !== 'transparent') {
    ctx.fillStyle = style.fillColor;
    ctx.fill();
  }

  // Render Cubic Coordinates (q, r, s)
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = style.font;
  ctx.fillStyle = style.textColor;
  ctx.fillText(`${hex.q},${hex.r},${hex.s}`, x, y);
};

const drawDebugGrid = (ctx: CanvasRenderingContext2D, radius: number = 5) => {
  for (let q = -radius; q <= radius; q++) {
    const r1 = Math.max(-radius, -q - radius);
    const r2 = Math.min(radius, -q + radius);
    for (let r = r1; r <= r2; r++) {
      const s = -q - r;
      const hex = new HexCoordinate(q, r, s);
      
      let style = GRID_HEX_STYLE;
      
      // Highlight Center
      if (q === 0 && r === 0 && s === 0) {
         style = CENTER_HEX_STYLE;
      } 
      
      drawHex(ctx, hex, style);
    }
  }
};

// --- Component ---

export const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Camera state
  const cameraRef = useRef({ x: 0, y: 0, zoom: 1 });
  
  // Interaction state
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // --- Render Loop ---
    let animationFrameId: number;

    const render = () => {
      // 1. Resize canvas to fill parent
      if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }

      // 2. Clear canvas
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 3. Apply Camera Transform
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(cameraRef.current.zoom, cameraRef.current.zoom);
      ctx.translate(cameraRef.current.x, cameraRef.current.y);

      // 4. Draw World
      drawDebugGrid(ctx);
      
      ctx.restore();

      // 5. Draw UI Overlay
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = 'black';
      ctx.font = '20px Arial';
      ctx.fillText(`Camera: (${Math.round(cameraRef.current.x)},${Math.round(cameraRef.current.y)}) Zoom: ${cameraRef.current.zoom.toFixed(2)}`, 20, 30);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // --- Event Listeners ---
    
    const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        const zoomDelta = -e.deltaY * ZOOM_SENSITIVITY;
        let newZoom = cameraRef.current.zoom + zoomDelta;
        
        // Clamp zoom
        newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
        
        cameraRef.current.zoom = newZoom;
    };

    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
      canvas.style.cursor = 'grabbing';
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;

      const dx = e.clientX - lastMousePosRef.current.x;
      const dy = e.clientY - lastMousePosRef.current.y;

      // Update last position for next frame
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };

      cameraRef.current.x += dx / cameraRef.current.zoom;
      cameraRef.current.y += dy / cameraRef.current.zoom;
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      canvas.style.cursor = 'grab';
    };

    // Attach listeners
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp); 

    // Initialize cursor
    canvas.style.cursor = 'grab';

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
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
