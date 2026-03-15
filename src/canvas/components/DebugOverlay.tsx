import React, { useState, useEffect } from 'react';
import type { DebugStats } from '../engine/CanvasController';
import { CanvasController } from '../engine/CanvasController';
import './DebugOverlay.css';

interface DebugOverlayProps {
  controller: CanvasController;
  /** Visibility is toggled by F3 via InputManager. */
  isVisible: boolean;
}

export const DebugOverlay: React.FC<DebugOverlayProps> = ({ controller, isVisible }) => {
  const [stats, setStats] = useState<DebugStats | null>(null);

  useEffect(() => {
    const unsubscribe = controller.addDebugStatsListener((newStats: DebugStats) => {
      setStats(newStats);
    });
    return () => unsubscribe();
  }, [controller]);

  if (!isVisible || !stats) {
    return null;
  }

  const { fps, camera, hoveredHex } = stats;
  const rotationDeg = ((camera.rotation * 180) / Math.PI).toFixed(0);

  return (
    <div className="debug-overlay" data-testid="debug-overlay">
      <div>FPS: {fps}</div>
      <div>
        Camera: ({camera.x.toFixed(1)}, {camera.y.toFixed(1)}) Zoom: {camera.zoom.toFixed(2)} Rot: {rotationDeg}°
      </div>
      <div>
        Hover: {hoveredHex ? `(${hoveredHex.q}, ${hoveredHex.r}, ${hoveredHex.s})` : 'None'}
      </div>
    </div>
  );
};
