import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Check whether an API key is a placeholder or unconfigured
export function isPlaceholderKey(key?: string): boolean {
  if (!key) return true;
  const trimmed = key.trim();
  const upper = trimmed.toUpperCase();
  return (
    upper === '' ||
    upper.includes('YOUR_API_KEY') ||
    upper.includes('PLACEHOLDER') ||
    upper.includes('CHANGE_ME') ||
    // Valid Google Firebase Web API keys are typically 39 chars starting with AIza
    !trimmed.startsWith('AIza')
  );
}

// Validates whether actual Firebase credentials have been configured
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  !isPlaceholderKey(firebaseConfig.apiKey) &&
  firebaseConfig.projectId &&
  !firebaseConfig.projectId.includes('placeholder')
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

// Only initialize Firebase Auth if a valid API key is present
// This ensures Next.js static prerendering on Vercel never crashes when env vars are pending,
// and prevents bogus requests to identitytoolkit.googleapis.com with dummy keys
if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
  } catch (err) {
    console.warn('[Firebase] Initialization skipped or encountered error:', err);
  }
} else {
  if (typeof window !== 'undefined') {
    console.warn(
      '[Firebase] Warning: NEXT_PUBLIC_FIREBASE_API_KEY is missing or set to a placeholder ("' +
      (firebaseConfig.apiKey ? firebaseConfig.apiKey.slice(0, 15) + '...' : 'empty') +
      '"). Real Firebase authentication requires a valid API key from Firebase Console (starts with "AIzaSy").'
    );
  }
}

export { firebaseConfig, app, auth };
export default app;
