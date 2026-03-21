import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { User, AnonymousUser, RegisteredUser } from '../models/User';
import { Game } from '../models/Game';
import { useAuthService, useFirestoreService } from '../services/hooks/useServices';
import { SessionContext } from './SessionContext';

export const SessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const authService = useAuthService();
  const firestoreService = useFirestoreService();
  const [user, setUser] = useState<User | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [activeGame, setActiveGame] = useState<Game | undefined>(undefined);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((firebaseUser) => {
      if (!firebaseUser) {
        // Automatically sign in anonymously if there is no user
        authService.signInAnonymously().catch((error) => {
          console.error("Failed to sign in anonymously", error);
          setIsInitializing(false);
        });
        return;
      }

      const currentUser = firebaseUser.isAnonymous
        ? new AnonymousUser(firebaseUser.uid)
        : new RegisteredUser(firebaseUser.uid, firebaseUser.displayName || firebaseUser.uid);

      firestoreService.loadAllGames(firebaseUser.uid)
        .then((loadedGames) => {
          setUser(currentUser);
          setGames(loadedGames);
          setIsInitializing(false);
        })
        .catch((error) => {
          console.error('Failed to load saved games', error);
          setUser(currentUser);
          setIsInitializing(false);
        });
    });

    return unsubscribe;
  }, [authService, firestoreService]);
  
  // Wait for auth to initialize before rendering children
  if (isInitializing) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>Loading Profile...</div>;
  }

  // Fallback for unexpected states
  if (!user) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'red' }}>Initialization Error. Please Refresh.</div>;
  }

  return (
    <SessionContext.Provider 
      value={{ 
        user, 
        games, 
        activeGame, 
        setActiveGame 
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};
