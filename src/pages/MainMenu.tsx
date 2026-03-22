import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameCard } from '../components/GameCard';
import { SettingsModal } from '../components/SettingsModal';
import { useSession } from '../context/SessionContext';
import { useAuthService } from '../services/hooks/useServices';
import { RegisteredUser } from '../models/User';
import { Game } from '../models/Game';
import { GameRules } from '../models/GameRules';
import './MainMenu.css';

export const MainMenu: React.FC = () => {
  const authService = useAuthService();
  const navigate = useNavigate();
  const { user, games, setActiveGame } = useSession();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleStartStandard = () => {
    const game = Game.create(GameRules.createStandard());
    setActiveGame(game);
    navigate('/game');
  };

  const handleStartTest = () => {
    const game = Game.create(GameRules.createTest());
    setActiveGame(game);
    navigate('/game');
  };

  const handleContinue = (gameId: string) => {
    const game = games.find(g => g.id === gameId);
    if (game) {
      setActiveGame(game);
      navigate('/game');
    }
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="main-menu">
      <div className="main-menu__container">
        <header className="main-menu__header">
          <h1 className="main-menu__title">Dorfromantik</h1>
          <div className="main-menu__profile">
            <span className={`main-menu__profile-badge ${user.isAnonymous ? 'main-menu__profile-badge--anon' : 'main-menu__profile-badge--perm'}`}>
              {user.isAnonymous ? 'Guest' : 'Player'}
            </span>
            <span className="main-menu__profile-name">
              {user.isAnonymous ? user.id.substring(0, 12) : (user as RegisteredUser).displayName}
            </span>
          </div>
        </header>
        
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
              {!user.isAnonymous && (
                <button 
                  className="main-menu__button main-menu__button--danger"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              )}
            </div>
          </div>

          <div className="main-menu__games-section">
            <span className="main-menu__section-title">Continue Journey</span>
            <div className="main-menu__games-list">
              {games.map(game => (
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


