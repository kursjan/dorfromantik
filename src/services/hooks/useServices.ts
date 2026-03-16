import { useContext } from 'react';
import type { IAuthService } from '../auth/IAuthService';
import type { IFirestoreService } from '../firestore/IFirestoreService';
import { ServiceContext } from '../ServiceContext';

export function useAuthService(): IAuthService {
  const context = useServiceContext();
  if (!context) {
    throw new Error('useAuthService must be used within a ServiceProvider');
  }
  return context.authService;
}

export function useFirestoreService(): IFirestoreService {
  const context = useServiceContext();
  if (!context) {
    throw new Error('useFirestoreService must be used within a ServiceProvider');
  }
  return context.firestoreService;
}

function useServiceContext() {
  return useContext(ServiceContext);
}