import React from 'react';
import './GameCard.css';

export interface GameCardProps {
  id: string;
  name: string;
  score: number;
  lastPlayed: string;
  onSelect: (id: string) => void;
}

export const GameCard: React.FC<GameCardProps> = ({ id, name, score, lastPlayed, onSelect }) => {
  const formattedDate = new Date(lastPlayed).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="game-card" onClick={() => onSelect(id)}>
      <h3 className="game-card__title">{name}</h3>
      <div className="game-card__content">
        <div className="game-card__stat">
          <span className="game-card__label">Score</span>
          <span className="game-card__value game-card__value--score">{score.toLocaleString()}</span>
        </div>
        <div className="game-card__stat">
          <span className="game-card__label">Last Played</span>
          <span className="game-card__value">{formattedDate}</span>
        </div>
      </div>
      <div className="game-card__footer">
        <button className="game-card__button">Continue</button>
      </div>
    </div>
  );
};

