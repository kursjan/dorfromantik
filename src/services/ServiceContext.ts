// src/services/ServiceContext.ts
import { createContext } from 'react';
import type { IAuthService } from './auth/IAuthService';
import type { IFirestoreService } from './firestore/IFirestoreService';

/**
 * ServiceContext provides dependency injection for auth and firestore services.
 */
export interface ServiceContextType {
  authService: IAuthService;
  firestoreService: IFirestoreService;
}

export const ServiceContext = createContext<ServiceContextType | null>(null);
