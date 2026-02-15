import React, { useRef, useEffect } from 'react';
import { pixelToHex, HEX_SIZE } from '../utils/HexUtils';
import { HexCoordinate } from '../models/HexCoordinate';
import { Camera } from '../utils/Camera';
import { HexRenderer } from '../graphics/HexRenderer';

// --- Constants ---
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3.0;
const ZOOM_SENSITIVITY = 0.001;

export const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // State Refs (Mutable, no re-renders)
  const cameraRef = useRef(new Camera(0, 0, 1));
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const hoveredHexRef = useRef<HexCoordinate | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderer = new HexRenderer(ctx);

    // --- Render Loop ---
    let animationFrameId: number;

    const render = () => {
      // 1. Resize
      if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }

      // 2. Clear
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 3. Camera Transform
      ctx.save();
      cameraRef.current.applyTransform(ctx, canvas.width, canvas.height);

      // 4. Draw World
      renderer.drawDebugGrid(5);
      renderer.drawHighlight(hoveredHexRef.current);
      
      ctx.restore();

      // 5. UI Overlay
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = 'black';
      ctx.font = '20px Arial';
      
      const cam = cameraRef.current;
      let debugText = `Camera: (${Math.round(cam.x)},${Math.round(cam.y)}) Zoom: ${cam.zoom.toFixed(2)}`;
      if (hoveredHexRef.current) {
          debugText += ` | Hover: (${hoveredHexRef.current.q},${hoveredHexRef.current.r},${hoveredHexRef.current.s})`;
      }
      ctx.fillText(debugText, 20, 30);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // --- Event Handlers ---
    
    const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        const zoomDelta = -e.deltaY * ZOOM_SENSITIVITY;
        cameraRef.current.zoomBy(zoomDelta, MIN_ZOOM, MAX_ZOOM);
    };

    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
      canvas.style.cursor = 'grabbing';
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // 1. Handle Pan
      if (isDraggingRef.current) {
        const dx = e.clientX - lastMousePosRef.current.x;
        const dy = e.clientY - lastMousePosRef.current.y;
        lastMousePosRef.current = { x: e.clientX, y: e.clientY };

        cameraRef.current.pan(dx, dy);
      }
      
      // 2. Handle Hover
      const worldPos = cameraRef.current.screenToWorld(mouseX, mouseY, canvas.width, canvas.height);
      const hex = pixelToHex(worldPos.x, worldPos.y, HEX_SIZE);
      
      if (!hoveredHexRef.current || !hoveredHexRef.current.equals(hex)) {
        hoveredHexRef.current = hex;
      }
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
