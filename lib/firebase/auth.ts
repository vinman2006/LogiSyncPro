import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './firebase';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

function requireAuth() {
  if (!auth || !isFirebaseConfigured) {
    throw new Error(
      'Firebase Auth is not yet configured. Please set your NEXT_PUBLIC_FIREBASE_* environment variables in Vercel or .env.local.'
    );
  }
  return auth;
}

// Google Sign-In via popup
export async function signInWithGoogle(): Promise<User> {
  const authInstance = requireAuth();
  const result = await signInWithPopup(authInstance, googleProvider);
  return result.user;
}

// Email + Password Sign-In
export async function signInWithEmail(
  email: string,
  password: string
): Promise<User> {
  const authInstance = requireAuth();
  const result = await signInWithEmailAndPassword(authInstance, email, password);
  return result.user;
}

// Email + Password Registration
export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<User> {
  const authInstance = requireAuth();
  const result = await createUserWithEmailAndPassword(authInstance, email, password);
  await updateProfile(result.user, { displayName });
  return result.user;
}

// Sign Out
export async function signOut(): Promise<void> {
  if (auth) {
    await firebaseSignOut(auth);
  }
}
