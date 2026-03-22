import React, { useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { User, AnonymousUser, RegisteredUser } from '../models/User';
import { Game } from '../models/Game';
import { useAuthService, useFirestoreService } from '../services/hooks/useServices';
import { UserContext, GameHistoryContext, ActiveGameContext } from './SessionContext';

export const SessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const authService = useAuthService();
  const firestoreService = useFirestoreService();
  const [user, setUser] = useState<User | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [activeGame, setActiveGame] = useState<Game | undefined>(undefined);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  // Auth: map Firebase user → domain User.
  useEffect(() => {
    return authService.onAuthStateChanged((firebaseUser) => {
      if (!firebaseUser) {
        authService.signInAnonymously().catch((error) => {
          console.error("Failed to sign in anonymously", error);
          setIsInitializing(false);
        });
        return;
      }

      const currentUser = firebaseUser.isAnonymous
        ? new AnonymousUser(firebaseUser.uid)
        : new RegisteredUser(firebaseUser.uid, firebaseUser.displayName || firebaseUser.uid);

      setUser(currentUser);
    });
  }, [authService]);

  // Games: separate effect so React unsubscribes from Firestore when `user` changes or unmounts.
  useEffect(() => {
    if (!user) {
      return;
    }

    const unsubscribe = firestoreService.subscribeToGames(user.id, (loadedGames) => {
      setGames(loadedGames);
      setIsInitializing(false);
    });

    return () => {
      unsubscribe();
      setGames([]);
    };
  }, [user, firestoreService]);
  
  // Memoize values to prevent unnecessary re-renders if provider re-renders
  const userValue = useMemo(() => user ? { user } : undefined, [user]);
  const gameHistoryValue = useMemo(() => ({ games }), [games]);
  const activeGameValue = useMemo(() => ({ activeGame, setActiveGame }), [activeGame]);

  // Wait for auth to initialize before rendering children
  if (isInitializing) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>Loading Profile...</div>;
  }

  // Fallback for unexpected states
  if (!userValue) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'red' }}>Initialization Error. Please Refresh.</div>;
  }

  return (
    <UserContext.Provider value={userValue}>
      <GameHistoryContext.Provider value={gameHistoryValue}>
        <ActiveGameContext.Provider value={activeGameValue}>
          {children}
        </ActiveGameContext.Provider>
      </GameHistoryContext.Provider>
    </UserContext.Provider>
  );
};
