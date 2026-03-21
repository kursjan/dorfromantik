import { createContext, useContext, type Context } from 'react';
import { Session } from '../models/Session';
import { Game } from '../models/Game';

export interface SessionContextType {
  session: Session;
  setActiveGame: (game: Game) => void;
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
