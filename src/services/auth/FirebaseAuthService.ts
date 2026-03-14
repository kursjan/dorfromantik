// src/services/auth/FirebaseAuthService.ts
import {
  signInAnonymously,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../firebase";
import type { IAuthService, AuthUser } from "./IAuthService";

function toAuthUser(user: { uid: string; isAnonymous: boolean; displayName: string | null }): AuthUser {
  return {
    uid: user.uid,
    isAnonymous: user.isAnonymous,
    displayName: user.displayName ?? null,
  };
}

/**
 * Firebase implementation of IAuthService.
 */
export class FirebaseAuthService implements IAuthService {
  async signInAnonymously(): Promise<AuthUser> {
    const credential = await signInAnonymously(auth);
    return toAuthUser(credential.user);
  }

  async signInWithGoogle(): Promise<AuthUser> {
    const provider = new GoogleAuthProvider();
    try {
      const credential = await signInWithPopup(auth, provider);
      return toAuthUser(credential.user);
    } catch (error) {
      console.error("Firebase Auth Error Details:", error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    await signOut(auth);
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const user = auth.currentUser;
    return user ? toAuthUser(user) : null;
  }

  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    return onAuthStateChanged(auth, (user) => {
      callback(user ? toAuthUser(user) : null);
    });
  }
}
