/** Minimal auth user shape for app consumption (anonymous vs registered, display name). */
export interface AuthUser {
  uid: string;
  isAnonymous: boolean;
  displayName: string | null;
}

export interface IAuthService {
  signInAnonymously(): Promise<AuthUser>;
  signInWithGoogle(): Promise<AuthUser>;
  signOut(): Promise<void>;
  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void;
}
