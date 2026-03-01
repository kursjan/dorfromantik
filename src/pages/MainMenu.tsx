import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameCard } from '../components/GameCard';
import { SettingsModal } from '../components/SettingsModal';
import './MainMenu.css';

// Placeholder data for saved games
const SAVED_GAMES = [
  { id: '1', name: 'Valley of Peace', score: 2450, lastPlayed: new Date().toISOString() },
  { id: '2', name: 'Forest Edge', score: 1200, lastPlayed: new Date(Date.now() - 86400000).toISOString() },
];

const MainMenu: React.FC = () => {
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="main-menu">
      <div className="main-menu__container">
        <h1 className="main-menu__title">Dorfromantik</h1>
        
        <div className="main-menu__content">
          <div className="main-menu__sidebar">
            <span className="main-menu__section-title">New Game</span>
            <div className="main-menu__actions">
              <button 
                className="main-menu__button"
                onClick={() => navigate('/game')}
              >
                Standard Game
              </button>
              <button 
                className="main-menu__button main-menu__button--secondary"
                onClick={() => navigate('/game')}
              >
                Test Game
              </button>
              <button 
                className="main-menu__button main-menu__button--secondary"
                onClick={() => setIsSettingsOpen(true)}
              >
                Settings
              </button>
              <button 
                className="main-menu__button main-menu__button--danger"
              >
                Logout
              </button>
            </div>
          </div>

          <div className="main-menu__games-section">
            <span className="main-menu__section-title">Continue Journey</span>
            <div className="main-menu__games-list">
              {SAVED_GAMES.map(game => (
                <GameCard 
                  key={game.id}
                  id={game.id}
                  name={game.name}
                  score={game.score}
                  lastPlayed={game.lastPlayed}
                  onSelect={(id) => {
                    console.log('Continuing game:', id);
                    navigate('/game');
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
};

export default MainMenu;
