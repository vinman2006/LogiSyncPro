'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import {
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '@/lib/firebase/firebase';
import {
  signInWithGoogle as fbSignInWithGoogle,
  signInWithEmail as fbSignInWithEmail,
  registerWithEmail as fbRegisterWithEmail,
  signOut as fbSignOut,
} from '@/lib/firebase/auth';
import { resolveUserName } from '@/lib/utils/userName';

export interface UserProfileData {
  id?: string;
  firebase_uid?: string;
  name?: string;
  display_name?: string;
  email?: string;
  created_at?: string;
}

export interface UserNodeData {
  id: string;
  business_id?: string;
  name: string;
  role: 'FARMER' | 'DISTRIBUTOR' | 'COLLECTOR';
  country?: string;
  city?: string;
  region?: string;
  node_type?: string;
  status?: string;
}

interface AuthContextType {
  user: FirebaseUser | null;
  userName: string;
  userProfile: UserProfileData | null;
  userNode: UserNodeData | null;
  hasCompletedOnboarding: boolean | null; // null = checking, true = has node/profile, false = needs setup
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userName, setUserName] = useState<string>('Vineet');
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [userNode, setUserNode] = useState<UserNodeData | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync user profile & active node with Neon
  const syncWithNeon = useCallback(async (fbUser: FirebaseUser) => {
    try {
      const fallbackName = resolveUserName(fbUser.displayName, fbUser.email);
      const res = await fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebaseUid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || fallbackName,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setUserProfile(data.user);
          setUserNode(data.node);
          setHasCompletedOnboarding(!data.needsOnboarding);
          const finalName = data.user?.name || data.user?.display_name || fallbackName;
          setUserName(finalName);
          return;
        }
      }
    } catch (err) {
      console.error('Error syncing user with Neon:', err);
    }
    // Fallback if network/offline
    const fallbackName = resolveUserName(fbUser.displayName, fbUser.email);
    setUserName(fallbackName);
    setHasCompletedOnboarding(true);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await syncWithNeon(user);
    }
  }, [user, syncWithNeon]);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        if (typeof document !== 'undefined') {
          document.cookie = `firebase-auth-session=${firebaseUser.uid}; path=/; max-age=2592000; SameSite=Lax`;
        }
        const initialName = resolveUserName(firebaseUser.displayName, firebaseUser.email);
        setUserName(initialName);
        setLoading(false);
        // Non-blocking sync with Neon in background
        syncWithNeon(firebaseUser).catch((err) =>
          console.warn('[Auth] Non-blocking Neon sync error:', err)
        );
      } else {
        if (typeof document !== 'undefined') {
          document.cookie = 'firebase-auth-session=; path=/; max-age=0; SameSite=Lax';
        }
        setUserName('Vineet');
        setUserProfile(null);
        setUserNode(null);
        setHasCompletedOnboarding(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [syncWithNeon]);

  const signInWithGoogle = useCallback(async () => {
    const user = await fbSignInWithGoogle();
    if (user && typeof document !== 'undefined') {
      document.cookie = `firebase-auth-session=${user.uid}; path=/; max-age=2592000; SameSite=Lax`;
    }
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const user = await fbSignInWithEmail(email, password);
    if (user && typeof document !== 'undefined') {
      document.cookie = `firebase-auth-session=${user.uid}; path=/; max-age=2592000; SameSite=Lax`;
    }
  }, []);

  const registerWithEmail = useCallback(
    async (email: string, password: string, displayName: string) => {
      const user = await fbRegisterWithEmail(email, password, displayName);
      if (user && typeof document !== 'undefined') {
        document.cookie = `firebase-auth-session=${user.uid}; path=/; max-age=2592000; SameSite=Lax`;
      }
    },
    []
  );

  const signOut = useCallback(async () => {
    await fbSignOut();
    if (typeof document !== 'undefined') {
      document.cookie = 'firebase-auth-session=; path=/; max-age=0; SameSite=Lax';
    }
    setUser(null);
    setUserName('Vineet');
    setUserProfile(null);
    setUserNode(null);
    setHasCompletedOnboarding(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        userName,
        userProfile,
        userNode,
        hasCompletedOnboarding,
        loading,
        refreshProfile,
        signInWithGoogle,
        signInWithEmail,
        registerWithEmail,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
