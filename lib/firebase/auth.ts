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
      'Firebase Authentication is not yet configured. Please ensure NEXT_PUBLIC_FIREBASE_API_KEY is set with a valid key (starting with AIzaSy) in your environment variables.'
    );
  }
  return auth;
}

/**
 * Maps raw Firebase error codes and exceptions to actionable, user-friendly error messages.
 */
export function getAuthErrorMessage(err: unknown): string {
  if (!err) return 'An unexpected error occurred. Please try again.';

  if (typeof err === 'string') {
    return err;
  }

  const errorObj = err as { code?: string; message?: string };
  const code = (errorObj.code || '').toLowerCase();
  const message = errorObj.message || '';

  // Firebase auth specific error codes
  switch (code) {
    case 'auth/invalid-api-key':
    case 'auth/api-key-not-valid':
      return 'The Firebase API key is invalid. Please verify NEXT_PUBLIC_FIREBASE_API_KEY in Vercel environment variables.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Please sign in instead.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 8 characters.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please verify your credentials and try again.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in was canceled before completing.';
    case 'auth/popup-blocked':
      return 'The sign-in popup was blocked by your browser. Please allow popups for this site and try again.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized in Firebase Console. Please add logisyncpro.vercel.app under Firebase Authentication → Settings → Authorized domains.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled in Firebase Console. Please enable Email/Password or Google provider under Authentication → Sign-in method.';
    case 'auth/network-request-failed':
      return 'Network connection issue. Please check your internet connection and try again.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Access is temporarily disabled. Please wait a few moments and try again.';
    default:
      break;
  }

  // Check error message contents
  if (message.includes('API key not valid') || message.includes('INVALID_ARGUMENT')) {
    return 'The Firebase API key is missing or invalid. Please configure NEXT_PUBLIC_FIREBASE_API_KEY in Vercel.';
  }
  if (message.includes('NEXT_PUBLIC_FIREBASE_') || message.includes('not yet configured')) {
    return message;
  }
  if (message.includes('popup-closed-by-user')) {
    return 'Sign-in was canceled.';
  }

  // Format any raw Firebase message nicely
  const cleaned = message
    .replace(/^Firebase:\s*/i, '')
    .replace(/\s*\(auth\/[^)]+\)\.?/i, '')
    .trim();

  return cleaned || 'Authentication failed. Please try again.';
}

// Google Sign-In via popup
export async function signInWithGoogle(): Promise<User> {
  const authInstance = requireAuth();
  const result = await signInWithPopup(authInstance, googleProvider);
  if (result?.user && typeof document !== 'undefined') {
    document.cookie = `firebase-auth-session=${result.user.uid}; path=/; max-age=2592000; SameSite=Lax`;
  }
  return result.user;
}

// Email + Password Sign-In
export async function signInWithEmail(
  email: string,
  password: string
): Promise<User> {
  const authInstance = requireAuth();
  const result = await signInWithEmailAndPassword(authInstance, email, password);
  if (result?.user && typeof document !== 'undefined') {
    document.cookie = `firebase-auth-session=${result.user.uid}; path=/; max-age=2592000; SameSite=Lax`;
  }
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
  if (result?.user && typeof document !== 'undefined') {
    document.cookie = `firebase-auth-session=${result.user.uid}; path=/; max-age=2592000; SameSite=Lax`;
  }
  return result.user;
}

// Sign Out
export async function signOut(): Promise<void> {
  if (auth) {
    await firebaseSignOut(auth);
  }
}
