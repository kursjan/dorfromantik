import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Session } from '../models/Session';
import { AnonymousUser, RegisteredUser } from '../models/User';
import { Game } from '../models/Game';
import { GameRules } from '../models/GameRules';
import { AuthService } from '../services/AuthService';
import { FirestoreService } from '../services/FirestoreService';
import { SessionContext } from './SessionContext';

export const SessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged((firebaseUser) => {
      if (!firebaseUser) {
        // Automatically sign in anonymously if there is no user
        AuthService.signInAnonymously().catch((error) => {
          console.error("Failed to sign in anonymously", error);
          setIsInitializing(false);
        });
        return;
      }

      const user = firebaseUser.isAnonymous
        ? new AnonymousUser(firebaseUser.uid)
        : new RegisteredUser(firebaseUser.uid, firebaseUser.displayName || firebaseUser.uid);

      FirestoreService.loadAllGames(firebaseUser.uid)
        .then((games) => {
          const newSession = new Session(`session-${firebaseUser.uid}`, user);
          newSession.games = games;
          setSession(newSession);
          setIsInitializing(false);
        })
        .catch((error) => {
          console.error('Failed to load saved games', error);
          const newSession = new Session(`session-${firebaseUser.uid}`, user);
          setSession(newSession);
          setIsInitializing(false);
        });
    });

    return unsubscribe;
  }, []);
  
  // Wait for auth to initialize before rendering children
  if (isInitializing) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>Loading Profile...</div>;
  }

  // Fallback for unexpected states
  if (!session) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'red' }}>Initialization Error. Please Refresh.</div>;
  }

  const startNewStandardGame = () => {
    const game = Game.create(GameRules.createStandard());
    const newSession = new Session(session.sessionId, session.user, game, [...session.games]);
    setSession(newSession);
  };

  const startNewTestGame = () => {
    const game = Game.create(GameRules.createTest());
    const newSession = new Session(session.sessionId, session.user, game, [...session.games]);
    setSession(newSession);
  };

  const continueGame = (gameId: string) => {
    const game = session.games.find(g => g.id === gameId);
    if (!game) throw new Error(`Cannot continue game: Game with id ${gameId} not found`);
    const newSession = new Session(session.sessionId, session.user, game, [...session.games]);
    setSession(newSession);
  };

  return (
    <SessionContext.Provider value={{ session, startNewStandardGame, startNewTestGame, continueGame }}>
      {children}
    </SessionContext.Provider>
  );
};
