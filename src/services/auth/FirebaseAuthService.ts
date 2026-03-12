// src/services/auth/FirebaseAuthService.ts
import { 
  signInAnonymously, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../firebase";
import type { IAuthService } from "./IAuthService";

/**
 * Firebase implementation of IAuthService.
 */
export class FirebaseAuthService implements IAuthService {
  async signInAnonymously(): Promise<string> {
    const credential = await signInAnonymously(auth);
    return credential.user.uid;
  }

  async signInWithGoogle(): Promise<string> {
    const provider = new GoogleAuthProvider();
    try {
      const credential = await signInWithPopup(auth, provider);
      return credential.user.uid;
    } catch (error) {
      console.error("Firebase Auth Error Details:", error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    await signOut(auth);
  }

  async getCurrentUser(): Promise<string | null> {
    return auth.currentUser?.uid || null;
  }

  onAuthStateChanged(callback: (userId: string | null) => void): () => void {
    return onAuthStateChanged(auth, (user) => {
      callback(user?.uid || null);
    });
  }
}
