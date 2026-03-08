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
  static async signInAnonymously(): Promise<FirebaseUser> {
    const credential = await signInAnonymously(auth);
    return credential.user;
  }

  static async signInWithGoogle(): Promise<FirebaseUser> {
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(auth, provider);
    return credential.user;
  }

  static async signOut(): Promise<void> {
    await signOut(auth);
  }

  static onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  static getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }
}
