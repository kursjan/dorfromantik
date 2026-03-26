import React from 'react';
import { CanvasController } from '../engine/CanvasController';
import { useCanvasControllerDebugStats } from '../hooks/useCanvasControllerDebugStats';
import './DebugOverlay.css';

interface DebugOverlayProps {
  controller: CanvasController;
  /** Visibility is toggled by F3 via InputManager. */
  isVisible: boolean;
}

export const DebugOverlay: React.FC<DebugOverlayProps> = ({ controller, isVisible }) => {
  const stats = useCanvasControllerDebugStats(controller);

  if (!isVisible || !stats) {
    return null;
  }

  const { fps, camera, hoveredHex } = stats;
  // Don't render if it's the initial empty snapshot
  if (fps === 0 && camera.zoom === 1 && hoveredHex === null && camera.x === 0 && camera.y === 0) {
    return null;
  }

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
