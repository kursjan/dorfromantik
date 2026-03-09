import { 
  signInAnonymously, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  type User as FirebaseUser
} from "firebase/auth";
import { auth } from "./firebase";

// Mock Auth State
let mockUser: Partial<FirebaseUser> | null = null;
let authListeners: ((user: FirebaseUser | null) => void)[] = [];

const notifyListeners = () => {
  authListeners.forEach(l => l(mockUser as FirebaseUser | null));
};

const isMockAuth = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

/**
 * Service to handle Firebase Authentication operations.
 */
export class AuthService {
  static async signInAnonymously(): Promise<FirebaseUser> {
    if (isMockAuth) {
      mockUser = { uid: 'mock-anon-123', isAnonymous: true, displayName: null };
      notifyListeners();
      return mockUser as FirebaseUser;
    }

    const credential = await signInAnonymously(auth);
    return credential.user;
  }

  static async signInWithGoogle(): Promise<FirebaseUser> {
    if (isMockAuth) {
      mockUser = { uid: 'mock-anon-123', isAnonymous: false, displayName: 'Test User' }; // Keep same mock ID to simulate linking
      notifyListeners();
      return mockUser as FirebaseUser;
    }

    const provider = new GoogleAuthProvider();
    try {
      // Linking accounts to an anonymous account requires more complicated flow, consider:
      // 1. Link
      // 2. Logout (maybe clear cookies)
      //    -> which will create new anonymous account
      // 3. Login again -> this will throw because new  credential-already-in-use
      //    meaning that kurs.jan@gmail is already linked to id from step 1.
      //
      // const currentUser = auth.currentUser;
      // if (currentUser?.isAnonymous) {
      //   // Try to upgrade anonymous account by linking Google
      //   const credential = await linkWithPopup(currentUser, provider);
      //   return credential.user;
      // }

      // Standard login or if already a registered user (switching accounts)
      const credential = await signInWithPopup(auth, provider);
      return credential.user;
    } catch (error) {
      console.error("Firebase Auth Error Details:", error);
      throw error;
    }
  }

  static async signOut(): Promise<void> {
    if (isMockAuth) {
      mockUser = null;
      notifyListeners();
      return;
    }
    await signOut(auth);
  }

  static onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    if (isMockAuth) {
      authListeners.push(callback);
      // Trigger immediately like Firebase does
      setTimeout(() => callback(mockUser as FirebaseUser | null), 0);
      return () => {
        authListeners = authListeners.filter(l => l !== callback);
      };
    }

    return onAuthStateChanged(auth, callback);
  }

  static getCurrentUser(): FirebaseUser | null {
    if (isMockAuth) return mockUser as FirebaseUser | null;
    return auth.currentUser;
  }
}
