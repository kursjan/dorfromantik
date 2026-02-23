import React, { useEffect, useRef } from 'react';
import { Tile } from '../../models/Tile';
import { TileRenderer } from '../graphics/TileRenderer';
import { DEFAULT_HEX_STYLE } from '../graphics/HexStyles';

interface TilePreviewProps {
  tile: Tile | null;
  size?: number;
}

export const TilePreview: React.FC<TilePreviewProps> = ({ tile, size = 40 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!tile) return;

    // Draw
    const renderer = new TileRenderer(ctx);
    // Center the tile
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // We need to pass coordinates that center the hex.
    // TileRenderer.drawTile takes x, y as center.
    renderer.drawTile(tile, centerX, centerY, { ...DEFAULT_HEX_STYLE, size });

  }, [tile, size]);

  // Adjust canvas size to fit the hex with some padding
  // Hex width = sqrt(3) * size
  // Hex height = 2 * size
  // Let's use 2.5 * size for a comfortable square
  const canvasSize = size * 3;

  return (
    <canvas 
      ref={canvasRef} 
      width={canvasSize} 
      height={canvasSize} 
      style={{ width: canvasSize, height: canvasSize }} 
      role="img"
      aria-label="Next tile preview"
    />
  );
};
