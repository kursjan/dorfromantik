import React from 'react';
import './ResetViewButton.css';

interface ResetViewButtonProps {
  /** Callback function when the button is clicked */
  onClick: () => void;
}

/**
 * A styled UI component to reset the canvas camera to its initial state.
 * Positioned as an overlay on the game canvas.
 */
export const ResetViewButton: React.FC<ResetViewButtonProps> = ({ onClick }) => {
  return (
    <button
      className="reset-view-button"
      onClick={onClick}
      aria-label="Reset View"
      title="Reset View"
      type="button"
    >
      <span className="reset-view-button__icon">↺</span>
      <span className="reset-view-button__label">Reset View</span>
    </button>
  );
};
