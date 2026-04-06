import React from 'react';
import { radiansToDegrees } from '../../../utils/Angle';
import { CanvasController } from '../engine/CanvasController';
import { useCanvasControllerDebugStats } from '../hooks/useCanvasControllerDebugStats';
import './DebugOverlay.css';

interface DebugOverlayProps {
  controller: CanvasController;
  isVisible: boolean;
}

export const DebugOverlay: React.FC<DebugOverlayProps> = ({ controller, isVisible }) => {
  const stats = useCanvasControllerDebugStats(controller);

  if (!isVisible || !stats) {
    return null;
  }

  const { fps, camera, hoveredHex } = stats;
  if (
    fps === 0 &&
    camera.zoom === 1 &&
    hoveredHex === null &&
    camera.position.x === 0 &&
    camera.position.y === 0
  ) {
    return null;
  }

  const rotationDeg = radiansToDegrees(camera.rotation).toFixed(0);

  return (
    <div className="debug-overlay" data-testid="debug-overlay">
      <div>FPS: {fps}</div>
      <div>
        Camera: ({camera.position.x.toFixed(1)}, {camera.position.y.toFixed(1)}) Zoom:{' '}
        {camera.zoom.toFixed(2)} Rot: {rotationDeg}°
      </div>
      <div>
        Hover: {hoveredHex ? `(${hoveredHex.q}, ${hoveredHex.r}, ${hoveredHex.s})` : 'None'}
      </div>
    </div>
  );
};
