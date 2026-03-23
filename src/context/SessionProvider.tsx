import React, { useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { User, AnonymousUser, RegisteredUser } from '../models/User';
import { Game } from '../models/Game';
import { useAuthService, useFirestoreService } from '../services/hooks/useServices';
import { UserContext, GameHistoryContext, ActiveGameContext } from './SessionContext';

type AuthState =
  | { status: 'initializing' }
  | { status: 'authenticated'; user: User }
  | { status: 'error' };

export const SessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const authService = useAuthService();
  const firestoreService = useFirestoreService();
  const [authState, setAuthState] = useState<AuthState>({ status: 'initializing' });
  const [games, setGames] = useState<Game[]>([]);
  const [activeGame, setActiveGame] = useState<Game | undefined>(undefined);

  // Auth: map Firebase user → domain User.
  useEffect(() => {
    return authService.onAuthStateChanged((firebaseUser) => {
      if (!firebaseUser) {
        authService.signInAnonymously().catch((error) => {
          console.error("Failed to sign in anonymously", error);
          setAuthState({ status: 'error' });
        });
        return;
      }

      const currentUser = firebaseUser.isAnonymous
        ? new AnonymousUser(firebaseUser.uid)
        : new RegisteredUser(firebaseUser.uid, firebaseUser.displayName || firebaseUser.uid);

      setAuthState({ status: 'authenticated', user: currentUser });
    });
  }, [authService]);

  // Games: separate effect so React unsubscribes from Firestore when `user` changes or unmounts.
  useEffect(() => {
    if (authState.status !== 'authenticated') {
      return;
    }

    const unsubscribe = firestoreService.subscribeToGames(authState.user.id, (loadedGames) => {
      setGames(loadedGames);
    });

    return () => {
      unsubscribe();
      setGames([]);
    };
  }, [authState, firestoreService]);
  
  // Memoize values to prevent unnecessary re-renders if provider re-renders
  const activeGameValue = useMemo(() => ({ activeGame, setActiveGame }), [activeGame]);
  const gameHistoryValue = useMemo(() => ({ games }), [games]);
  const userValue = useMemo(
    () => authState.status === 'authenticated' ? { user: authState.user } : undefined,
    [authState]
  );

  // Wait for auth to initialize before rendering children
  if (authState.status === 'initializing') {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>Loading Profile...</div>;
  }

  // Error state
  if (authState.status === 'error') {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'red' }}>Initialization Error. Please Refresh.</div>;
  }

  return (
    <UserContext.Provider value={userValue!}>
      <GameHistoryContext.Provider value={gameHistoryValue}>
        <ActiveGameContext.Provider value={activeGameValue}>
          {children}
        </ActiveGameContext.Provider>
      </GameHistoryContext.Provider>
    </UserContext.Provider>
  );
};
