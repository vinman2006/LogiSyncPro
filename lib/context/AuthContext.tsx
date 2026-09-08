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

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    await fbSignInWithGoogle();
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    await fbSignInWithEmail(email, password);
  }, []);

  const registerWithEmail = useCallback(
    async (email: string, password: string, displayName: string) => {
      await fbRegisterWithEmail(email, password, displayName);
    },
    []
  );

  const signOut = useCallback(async () => {
    await fbSignOut();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, signInWithGoogle, signInWithEmail, registerWithEmail, signOut }}
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
