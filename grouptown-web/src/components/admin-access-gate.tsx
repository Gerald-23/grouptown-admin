'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

import { useAuth } from '@/components/auth-context';
import { hasFirebaseConfig } from '@/lib/firebase/config';
import { routes } from '@/lib/routes';

function isAdminRole(role?: string) {
  const normalized = role?.trim().toLowerCase();
  return normalized === 'admin' || normalized === 'superadmin';
}

export function AdminAccessGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isHydrating, user } = useAuth();
  const isAdminLoginRoute = pathname === routes.adminLogin;

  useEffect(() => {
    if (isAdminLoginRoute || !hasFirebaseConfig() || isHydrating) {
      return;
    }

    if (!isAuthenticated || !user?.uid) {
      router.replace(`${routes.adminLogin}?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!isAdminRole(user.role)) {
      router.replace(routes.dashboard);
    }
  }, [isAdminLoginRoute, isAuthenticated, isHydrating, pathname, router, user?.role, user?.uid]);

  if (isAdminLoginRoute) {
    return <>{children}</>;
  }

  if (!hasFirebaseConfig()) {
    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          padding: '24px',
          background: '#f4f6f8',
        }}>
        <section
          style={{
            width: 'min(560px, 100%)',
            borderRadius: '24px',
            padding: '28px',
            background: '#ffffff',
            boxShadow: '0 24px 60px rgba(15, 23, 42, 0.12)',
          }}>
          <p style={{ margin: 0, color: '#8a5a00', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
            Admin blocked
          </p>
          <h1 style={{ margin: '10px 0 12px', fontSize: '1.8rem' }}>Firebase web configuration is missing</h1>
          <p style={{ margin: 0, color: '#475569', lineHeight: 1.6 }}>
            The live admin console now requires a Firebase-backed sign-in. Add the production Firebase web env vars to
            this web app before using the hosted admin panel.
          </p>
        </section>
      </main>
    );
  }

  if (isHydrating || !isAuthenticated || !user?.uid || !isAdminRole(user.role)) {
    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          padding: '24px',
          background: '#f4f6f8',
          color: '#475569',
          fontSize: '0.95rem',
        }}>
        Verifying admin session...
      </main>
    );
  }

  return <>{children}</>;
}
