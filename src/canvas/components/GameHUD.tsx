import React from 'react';
import './GameHUD.css';

interface GameHUDProps {
  /** The current game score */
  score: number;
  /** The number of tiles remaining in the queue */
  remainingTurns: number;
}

/**
 * GameHUD component displays the current score and remaining turns.
 * Positioned as an overlay on the game canvas.
 */
export const GameHUD: React.FC<GameHUDProps> = ({ score, remainingTurns }) => {
  return (
    <div className="game-hud">
      <div className="game-hud__item">
        <span className="game-hud__label">Score</span>
        <span className="game-hud__value">{score}</span>
      </div>
      <div className="game-hud__divider" />
      <div className="game-hud__item">
        <span className="game-hud__label">Tiles</span>
        <span className="game-hud__value">{remainingTurns}</span>
      </div>
    </div>
  );
};
