'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useAuth } from '@/components/auth-context';
import type { LoginPageData } from '@/lib/firebase/login-data';
import { routes } from '@/lib/routes';

import styles from './login-page.module.css';

type LoginPageProps = {
  data: LoginPageData;
  mode?: 'default' | 'admin';
  redirectTo?: string;
};

export function LoginPage({ data, mode = 'default', redirectTo }: LoginPageProps) {
  const router = useRouter();
  const { signIn } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting'>('idle');
  const [error, setError] = useState('');
  const isAdminMode = mode === 'admin';

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setStatus('submitting');

    const result = await signIn({
      email: identifier,
      password,
      requireFirebase: isAdminMode,
      requireRole: isAdminMode ? 'admin' : undefined,
    });

    if (!result.ok) {
      setStatus('idle');
      setError(result.error ?? 'Unable to sign in.');
      return;
    }

    const isAdmin = ['admin', 'superadmin'].includes(result.user?.role?.toLowerCase() ?? '');
    router.push(redirectTo || (isAdmin ? routes.admin : routes.dashboard));
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link className={styles.brand} href={routes.home}>
            GroupTown
          </Link>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.content}>
          <div className={styles.card}>
            <div className={styles.headingBlock}>
              <h1>{isAdminMode ? 'Admin Sign In' : data.title}</h1>
              <p>
                {isAdminMode
                  ? 'Use a real Firebase-backed admin account to access the SHOP admin console.'
                  : data.subtitle}
              </p>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <label className={styles.field}>
                <span>{data.identifierLabel}</span>
                <input
                  autoComplete="username"
                  onChange={(event) => setIdentifier(event.target.value)}
                  placeholder={data.identifierPlaceholder}
                  required
                  type="text"
                  value={identifier}
                />
              </label>

              <div className={styles.field}>
                <div className={styles.passwordLabelRow}>
                  <span>{data.passwordLabel.toUpperCase()}</span>
                  <Link className={styles.inlineLink} href={routes.resetPassword}>
                    {data.forgotPasswordLabel}
                  </Link>
                </div>
                <div className={styles.passwordWrap}>
                  <input
                    autoComplete="current-password"
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                  />
                  <button
                    className={styles.togglePasswordButton}
                    onClick={() => setShowPassword((current) => !current)}
                    type="button">
                    <span className="material-symbols-outlined">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <label className={styles.rememberRow}>
                <input
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                  type="checkbox"
                />
                <span>{data.rememberLabel}</span>
              </label>

              <button className={styles.submitButton} disabled={status === 'submitting'} type="submit">
                {status === 'submitting' ? data.submittingLabel : data.submitLabel}
              </button>
              {error ? <p className={styles.inlineError}>{error}</p> : null}
            </form>

            <div className={styles.altActions}>
              {isAdminMode ? (
                <p>Admin access is restricted to approved platform operators.</p>
              ) : (
                <>
                  <p>
                    New to GroupTown? <Link href={routes.register}>{data.createAccountLabel}</Link>
                  </p>
                  <Link className={styles.agaLink} href={routes.agent}>
                    {data.agaLabel}
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className={styles.backLinkWrap}>
            <Link className={styles.backLink} href={routes.home}>
              <span className="material-symbols-outlined">arrow_back</span>
              <span>{data.backLabel}</span>
            </Link>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span className={styles.footerBrand}>GroupTown</span>
          <div className={styles.footerLinks}>
            <Link href={routes.terms}>Terms of Service</Link>
            <Link href={routes.privacy}>Privacy Policy</Link>
            <Link href={routes.contact}>Support</Link>
          </div>
          <p>&copy; 2024 GroupTown. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
