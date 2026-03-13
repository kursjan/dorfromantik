// src/services/auth/IAuthService.ts

export interface IAuthService {
  signInAnonymously(): Promise<string>;
  signInWithGoogle(): Promise<string>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<string | null>;
  onAuthStateChanged(callback: (userId: string | null) => void): () => void;
}
