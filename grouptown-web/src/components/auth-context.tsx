'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut as firebaseSignOut, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import { getAuthClient, getDb } from '@/lib/firebase/client';
import { toWebAuthError } from '@/lib/firebase/error-messages';
import { logAdminSystemAlert } from '@/lib/firebase/system-alerts';

type AuthUser = {
  uid?: string;
  name: string;
  role: string;
  email?: string;
};

type SignInInput =
  | {
      email: string;
      password: string;
      requireFirebase?: boolean;
      requireRole?: 'admin';
    }
  | AuthUser
  | undefined;

type SignInResult = {
  ok: boolean;
  usedFirebase: boolean;
  user?: AuthUser | null;
  error?: string;
};

type AuthContextValue = {
  isAuthenticated: boolean;
  user: AuthUser | null;
  isHydrating: boolean;
  signIn: (input?: SignInInput) => Promise<SignInResult>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const authClient = getAuthClient();
const db = getDb();

function isAdminRole(role?: string) {
  const normalized = role?.trim().toLowerCase();
  return normalized === 'admin' || normalized === 'superadmin';
}

function mapFirebaseUser(user: FirebaseUser, data?: Partial<AuthUser>): AuthUser {
  const fallbackName = user.email?.split('@')[0]?.replace(/[._-]+/g, ' ') ?? 'GroupTown User';

  return {
    uid: user.uid,
    name: typeof data?.name === 'string' && data.name.trim() ? data.name.trim() : user.displayName?.trim() || fallbackName,
    role: typeof data?.role === 'string' && data.role.trim() ? data.role.trim() : 'Registered member',
    email: user.email ?? undefined,
  };
}

async function hydrateFirebaseUser(user: FirebaseUser): Promise<AuthUser> {
  if (!db) {
    return mapFirebaseUser(user);
  }

  try {
    const snap = await getDoc(doc(db, 'shopUsers', user.uid));
    return snap.exists() ? mapFirebaseUser(user, snap.data() as Partial<AuthUser>) : mapFirebaseUser(user);
  } catch {
    return mapFirebaseUser(user);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<AuthUser | null>(null);
  const [localUser, setLocalUser] = useState<AuthUser | null>(null);
  const [isHydrating, setIsHydrating] = useState(Boolean(authClient));

  useEffect(() => {
    if (!authClient) {
      setIsHydrating(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(authClient, async (nextUser) => {
      if (!nextUser) {
        setFirebaseUser(null);
        setIsHydrating(false);
        return;
      }

      const hydrated = await hydrateFirebaseUser(nextUser);
      setFirebaseUser(hydrated);
      setIsHydrating(false);
    });

    return unsubscribe;
  }, []);

  const user = firebaseUser ?? localUser;

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: user !== null,
      isHydrating,
      user,
      signIn: async (input) => {
        if (
          input &&
          'email' in input &&
          'password' in input &&
          typeof input.email === 'string' &&
          typeof input.password === 'string'
        ) {
          if (input.requireFirebase && !authClient) {
            return {
              ok: false,
              usedFirebase: false,
              error: 'Firebase Auth is required for admin sign in in this web environment.',
            };
          }

          if (!authClient) {
            const fallbackUser = { name: input.email || 'GroupTown User', role: 'Registered member', email: input.email };
            setLocalUser(fallbackUser);
            return { ok: true, usedFirebase: false, user: fallbackUser };
          }

          try {
            const credential = await signInWithEmailAndPassword(authClient, input.email.trim(), input.password);
            const hydrated = await hydrateFirebaseUser(credential.user);

            if (input.requireRole === 'admin' && !isAdminRole(hydrated.role)) {
              await firebaseSignOut(authClient);
              setFirebaseUser(null);
              return {
                ok: false,
                usedFirebase: true,
                error: 'This account does not have admin access.',
              };
            }

            setFirebaseUser(hydrated);
            return { ok: true, usedFirebase: true, user: hydrated };
          } catch (error) {
            const resolved = toWebAuthError(error, 'Unable to sign in right now.');
            if (resolved.audience === 'system') {
              void logAdminSystemAlert({
                message: resolved.message,
                sourceArea: input.requireRole === 'admin' ? 'admin-login' : 'web-login',
                code: resolved.code,
              });
            }
            return { ok: false, usedFirebase: true, error: resolved.message };
          }
        }

        const nextUser = input && 'name' in input && 'role' in input ? input : { name: 'Alexander', role: 'Active Participant' };
        setLocalUser(nextUser);
        return { ok: true, usedFirebase: false, user: nextUser };
      },
      signOut: async () => {
        if (authClient) {
          await firebaseSignOut(authClient);
        }

        setLocalUser(null);
        setFirebaseUser(null);
      },
    }),
    [isHydrating, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
