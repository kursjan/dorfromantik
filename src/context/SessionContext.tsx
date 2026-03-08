import { createContext, useContext } from 'react';
import { Session } from '../models/Session';

export interface SessionContextType {
  session: Session;
  startNewStandardGame: () => void;
  startNewTestGame: () => void;
  continueGame: (gameId: string) => void;
}

export const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
