import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { Session } from '../models/Session';
import { User } from '../models/User';
import { Game } from '../models/Game';
import { Board } from '../models/Board';
import { GameRules } from '../models/GameRules';

interface SessionContextType {
  session: Session;
  startNewStandardGame: () => void;
  startNewTestGame: () => void;
  continueGame: (gameId: string) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const createInitialSession = () => {
  const user = new User('local-player');
  const session = new Session('local-session', user);

  // Add some historical games for demonstration
  session.games.push(
    new Game({ 
      id: '1', 
      name: 'Valley of Peace', 
      score: 2450, 
      lastPlayed: new Date().toISOString(),
      board: new Board(),
      rules: GameRules.createStandard()
    })
  );
  session.games.push(
    new Game({ 
      id: '2', 
      name: 'Forest Edge', 
      score: 1200, 
      lastPlayed: new Date(Date.now() - 86400000).toISOString(),
      board: new Board(),
      rules: GameRules.createStandard()
    })
  );
  return session;
};

export const SessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session>(createInitialSession);

  const startNewStandardGame = () => {
    const game = Game.create(GameRules.createStandard());
    const newSession = new Session(session.sessionId, session.user, game, [...session.games]);
    setSession(newSession);
  };

  const startNewTestGame = () => {
    // For now, same as standard
    const game = Game.create(GameRules.createTest());
    const newSession = new Session(session.sessionId, session.user, game, [...session.games]);
    setSession(newSession);
  };

  const continueGame = (gameId: string) => {
    const game = session.games.find(g => g.id === gameId);
    if (game) {
      const newSession = new Session(session.sessionId, session.user, game, [...session.games]);
      setSession(newSession);
    }
  };

  return (
    <SessionContext.Provider value={{ session, startNewStandardGame, startNewTestGame, continueGame }}>
      {children}
    </SessionContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

