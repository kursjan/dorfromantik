import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameCard } from '../components/GameCard';
import { SettingsModal } from '../components/SettingsModal';
import { useSession } from '../context/SessionContext';
import { AuthService } from '../services/AuthService';
import './MainMenu.css';

const MainMenu: React.FC = () => {
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { session, startNewStandardGame, startNewTestGame, continueGame } = useSession();

  const handleStartStandard = () => {
    startNewStandardGame();
    navigate('/game');
  };

  const handleStartTest = () => {
    startNewTestGame();
    navigate('/game');
  };

  const handleContinue = (gameId: string) => {
    continueGame(gameId);
    navigate('/game');
  };

  const handleLogout = async () => {
    try {
      await AuthService.signOut();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

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
                onClick={handleStartStandard}
              >
                Standard Game
              </button>
              <button 
                className="main-menu__button main-menu__button--secondary"
                onClick={handleStartTest}
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
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>

          <div className="main-menu__games-section">
            <span className="main-menu__section-title">Continue Journey</span>
            <div className="main-menu__games-list">
              {session.games.map(game => (
                <GameCard 
                  key={game.id}
                  id={game.id}
                  name={game.name}
                  score={game.score}
                  lastPlayed={game.lastPlayed}
                  onSelect={handleContinue}
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
