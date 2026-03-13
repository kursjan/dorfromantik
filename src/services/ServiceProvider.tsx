// src/services/ServiceProvider.tsx
import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { ServiceContext, type ServiceContextType } from './ServiceContext';
import { FirebaseAuthService } from './auth/FirebaseAuthService';
import { InMemoryAuthService } from './auth/InMemoryAuthService';
import { FirebaseFirestoreService } from './firestore/FirebaseFirestoreService';
import { InMemoryFirestoreService } from './firestore/InMemoryFirestoreService';

/**
 * ServiceProvider provides dependency injection for auth and firestore services.
 * It reads VITE_USE_MOCK_AUTH to determine which implementations to use.
 */
export function ServiceProvider({ children }: { children: ReactNode }) {
  const useMockAuth = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

  const authService = useMemo(() => {
    return useMockAuth 
      ? new InMemoryAuthService()
      : new FirebaseAuthService();
  }, [useMockAuth]);

  const firestoreService = useMemo(() => {
    return useMockAuth 
      ? new InMemoryFirestoreService()
      : new FirebaseFirestoreService();
  }, [useMockAuth]);

  const value = useMemo<ServiceContextType>(() => ({
    authService,
    firestoreService,
  }), [authService, firestoreService]);

  return (
    <ServiceContext.Provider value={value}>
      {children}
    </ServiceContext.Provider>
  );
}
