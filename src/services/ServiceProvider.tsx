import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { ServiceContext, type ServiceContextType } from './ServiceContext';
import type { IAuthService } from './auth/IAuthService';
import { FirebaseAuthService } from './auth/FirebaseAuthService';
import { InMemoryAuthService } from './auth/InMemoryAuthService';
import type { IFirestoreService } from './firestore/IFirestoreService';
import { FirebaseFirestoreService } from './firestore/FirebaseFirestoreService';
import { InMemoryFirestoreService } from './firestore/InMemoryFirestoreService';

export interface ServiceProviderProps {
  children: ReactNode;
  /** When provided, used instead of env-based creation (e.g. for tests with InMemoryAuthService). */
  authService?: IAuthService;
  /** When provided, used instead of env-based creation (e.g. for tests with InMemoryFirestoreService). */
  firestoreService?: IFirestoreService;
}

/**
 * ServiceProvider provides dependency injection for auth and firestore services.
 * When authService/firestoreService are passed (e.g. in tests), they are used;
 * otherwise it reads VITE_USE_MOCK_AUTH to create the default implementations.
 */
export function ServiceProvider({ children, authService: authServiceProp, firestoreService: firestoreServiceProp }: ServiceProviderProps) {
  const useMockAuth = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

  const defaultAuth = useMemo(() => (
    useMockAuth ? new InMemoryAuthService() : new FirebaseAuthService()
  ), [useMockAuth]);

  const defaultFirestore = useMemo(() => (
    useMockAuth ? new InMemoryFirestoreService() : new FirebaseFirestoreService()
  ), [useMockAuth]);

  const authService = authServiceProp ?? defaultAuth;
  const firestoreService = firestoreServiceProp ?? defaultFirestore;

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
