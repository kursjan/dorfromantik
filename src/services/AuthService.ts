import { 
  signInAnonymously, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  type User as FirebaseUser
} from "firebase/auth";
import { auth } from "./firebase";

/**
 * Service to handle Firebase Authentication operations.
 */
export class AuthService {
  /**
   * Signs in the user anonymously.
   * Useful for immediate play without requiring credentials.
   */
  static async signInAnonymously(): Promise<FirebaseUser> {
    const credential = await signInAnonymously(auth);
    return credential.user;
  }

  /**
   * Signs in the user using Google OAuth.
   */
  static async signInWithGoogle(): Promise<FirebaseUser> {
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(auth, provider);
    return credential.user;
  }

  /**
   * Signs out the current user.
   */
  static async signOut(): Promise<void> {
    await signOut(auth);
  }

  /**
   * Listens for changes in the authentication state.
   * @param callback - Function to call when the auth state changes.
   * @returns Unsubscribe function.
   */
  static onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  /**
   * Gets the current user, if any.
   */
  static getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }
}
