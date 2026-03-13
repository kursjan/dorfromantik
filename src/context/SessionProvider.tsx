import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Session } from '../models/Session';
import { AnonymousUser } from '../models/User';
import { Game } from '../models/Game';
import { GameRules } from '../models/GameRules';
import { useAuthService } from '../services/hooks/useServices';
import { useFirestoreService } from '../services/hooks/useServices';
import { SessionContext } from './SessionContext';

export const SessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const authService = useAuthService();
  const firestoreService = useFirestoreService();

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((userId) => {
      if (!userId) {
        // Automatically sign in anonymously if there is no user
        authService.signInAnonymously()
          .then((newUserId) => {
            // Create anonymous user for new user
            const user = new AnonymousUser(newUserId);
            
            // Load games for this user
            firestoreService.loadAllGames(newUserId)
              .then((games) => {
                const newSession = new Session(`session-${newUserId}`, user);
                newSession.games = games;
                setSession(newSession);
                setIsInitializing(false);
              })
              .catch((error) => {
                console.error('Failed to load saved games', error);
                const newSession = new Session(`session-${newUserId}`, user);
                setSession(newSession);
                setIsInitializing(false);
              });
          })
          .catch((error) => {
            console.error("Failed to sign in anonymously", error);
            setIsInitializing(false);
          });
        return;
      }

      // For now, treat all users as anonymous since we don't have display name info
      // In a real implementation, we would need to fetch user profile data
      const user = new AnonymousUser(userId);

      firestoreService.loadAllGames(userId)
        .then((games) => {
          const newSession = new Session(`session-${userId}`, user);
          newSession.games = games;
          setSession(newSession);
          setIsInitializing(false);
        })
        .catch((error) => {
          console.error('Failed to load saved games', error);
          const newSession = new Session(`session-${userId}`, user);
          setSession(newSession);
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
