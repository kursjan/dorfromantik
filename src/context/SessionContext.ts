import { createContext, useContext, type Context } from 'react';
import { User } from '../models/User';
import { Game } from '../models/Game';

export interface SessionContextType {
  user: User;
  games: Game[];
  activeGame?: Game;
  setActiveGame: (game: Game | undefined) => void;
}

export const SessionContext: Context<SessionContextType | undefined> =
  createContext<SessionContextType | undefined>(undefined);

export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext); 
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
