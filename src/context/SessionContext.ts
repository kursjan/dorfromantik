import { createContext, useContext, type Context } from 'react';
import { User } from '../models/User';
import { Game } from '../models/Game';

export interface UserContextType {
  user: User;
}

export interface GameHistoryContextType {
  games: Game[];
}

export interface ActiveGameContextType {
  activeGame?: Game;
  setActiveGame: (game: Game | undefined) => void;
}

// Granular Contexts
export const UserContext: Context<UserContextType | undefined> = 
  createContext<UserContextType | undefined>(undefined);

export const GameHistoryContext: Context<GameHistoryContextType | undefined> = 
  createContext<GameHistoryContextType | undefined>(undefined);

export const ActiveGameContext: Context<ActiveGameContextType | undefined> = 
  createContext<ActiveGameContextType | undefined>(undefined);

// Granular Hooks
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider (SessionProvider)');
  }
  return context;
};

export const useGameHistory = (): GameHistoryContextType => {
  const context = useContext(GameHistoryContext);
  if (context === undefined) {
    throw new Error('useGameHistory must be used within a GameHistoryProvider (SessionProvider)');
  }
  return context;
};

export const useActiveGame = (): ActiveGameContextType => {
  const context = useContext(ActiveGameContext);
  if (context === undefined) {
    throw new Error('useActiveGame must be used within an ActiveGameProvider (SessionProvider)');
  }
  return context;
};
