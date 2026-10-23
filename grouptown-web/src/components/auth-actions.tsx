'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/components/auth-context';
import { routes } from '@/lib/routes';

type AuthActionsProps = {
  compact?: boolean;
};

export function AuthActions({ compact = false }: AuthActionsProps) {
  const router = useRouter();
  const { isAuthenticated, user, signOut } = useAuth();

  if (isAuthenticated) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: compact ? 8 : 16 }}>
        <button
          type="button"
          onClick={() => router.push(routes.dashboard)}
          style={{
            border: 0,
            background: 'transparent',
            color: 'var(--primary)',
            font: 'inherit',
            fontSize: compact ? '0.75rem' : '0.875rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}>
          {user?.name ?? 'Workspace'}
        </button>
        <button
          type="button"
          onClick={() => {
            signOut();
            router.push(routes.home);
          }}
          style={{
            border: '1px solid var(--primary)',
            background: 'transparent',
            color: 'var(--primary)',
            borderRadius: 12,
            padding: compact ? '10px 14px' : '14px 24px',
            font: 'inherit',
            fontSize: compact ? '0.7rem' : '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}>
          Logout
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: compact ? 8 : 16 }}>
      <Link
        href={routes.login}
        style={{
          color: 'var(--primary)',
          fontSize: compact ? '0.75rem' : '0.875rem',
          fontWeight: 700,
          textTransform: 'uppercase',
        }}>
        Login
      </Link>
      <Link
        href={routes.register}
        style={{
          background: 'var(--primary)',
          border: '1px solid var(--primary)',
          color: 'var(--on-primary)',
          borderRadius: 12,
          padding: compact ? '10px 14px' : '14px 24px',
          fontSize: compact ? '0.7rem' : '0.75rem',
          fontWeight: 700,
          textTransform: 'uppercase',
        }}>
        Register
      </Link>
    </div>
  );
}
