import React, { useState, useEffect } from 'react';
import type { DebugStats } from '../engine/CanvasController';
import { CanvasController } from '../engine/CanvasController';
import './DebugOverlay.css';

interface DebugOverlayProps {
  controller: CanvasController;
}

export const DebugOverlay: React.FC<DebugOverlayProps> = ({ controller }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [stats, setStats] = useState<DebugStats | null>(null);

  useEffect(() => {
    // 1. Toggle visibility with F3
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'F3') {
        event.preventDefault();
        setIsVisible((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // 2. Subscribe to debug stats
    const unsubscribe = controller.addDebugStatsListener((newStats: DebugStats) => {
      setStats(newStats);
    });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      unsubscribe();
    };
  }, [controller]);

  if (!isVisible || !stats) {
    return null;
  }

  const { fps, camera, hoveredHex } = stats;

  return (
    <div className="debug-overlay" data-testid="debug-overlay">
      <div>FPS: {fps}</div>
      <div>
        Camera: ({camera.x.toFixed(1)}, {camera.y.toFixed(1)}) Zoom: {camera.zoom.toFixed(2)}
      </div>
      <div>
        Hover: {hoveredHex ? `(${hoveredHex.q}, ${hoveredHex.r}, ${hoveredHex.s})` : 'None'}
      </div>
    </div>
  );
};
