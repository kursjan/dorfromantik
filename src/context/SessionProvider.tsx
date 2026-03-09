import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Session } from '../models/Session';
import { AnonymousUser, RegisteredUser } from '../models/User';
import { Game } from '../models/Game';
import { Board } from '../models/Board';
import { GameRules } from '../models/GameRules';
import { AuthService } from '../services/AuthService';
import { SessionContext } from './SessionContext';

export const SessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        const user = firebaseUser.isAnonymous
          ? new AnonymousUser(firebaseUser.uid)
          : new RegisteredUser(firebaseUser.uid, firebaseUser.displayName || firebaseUser.uid);
        
        const newSession = new Session(`session-${firebaseUser.uid}`, user);

        // Add some historical games for demonstration (will be replaced by Firestore later)
        newSession.games.push(
          new Game({ 
            id: '1', 
            name: 'Valley of Peace', 
            score: 2450, 
            lastPlayed: new Date().toISOString(),
            board: new Board(),
            rules: GameRules.createStandard()
          })
        );
        newSession.games.push(
          new Game({ 
            id: '2', 
            name: 'Forest Edge', 
            score: 1200, 
            lastPlayed: new Date(Date.now() - 86400000).toISOString(),
            board: new Board(),
            rules: GameRules.createStandard()
          })
        );
        setSession(newSession);
        setIsInitializing(false);
      } else {
        // Automatically sign in anonymously if there is no user
        AuthService.signInAnonymously().catch((error) => {
          console.error("Failed to sign in anonymously", error);
          setIsInitializing(false);
        });
      }
    });

    return unsubscribe;
  }, []);

  const startNewStandardGame = () => {
    if (!session) throw new Error("Cannot start game: Session is not initialized");
    const game = Game.create(GameRules.createStandard());
    const newSession = new Session(session.sessionId, session.user, game, [...session.games]);
    setSession(newSession);
  };

  const startNewTestGame = () => {
    if (!session) throw new Error("Cannot start game: Session is not initialized");
    const game = Game.create(GameRules.createTest());
    const newSession = new Session(session.sessionId, session.user, game, [...session.games]);
    setSession(newSession);
  };

  const continueGame = (gameId: string) => {
    if (!session) throw new Error("Cannot continue game: Session is not initialized");
    const game = session.games.find(g => g.id === gameId);
    if (!game) throw new Error(`Cannot continue game: Game with id ${gameId} not found`);
    const newSession = new Session(session.sessionId, session.user, game, [...session.games]);
    setSession(newSession);
  };

  // Wait for auth to initialize before rendering children
  if (isInitializing) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>Loading Profile...</div>;
  }

  // Fallback for unexpected states
  if (!session) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'red' }}>Initialization Error. Please Refresh.</div>;
  }

  return (
    <SessionContext.Provider value={{ session, startNewStandardGame, startNewTestGame, continueGame }}>
      {children}
    </SessionContext.Provider>
  );
};
