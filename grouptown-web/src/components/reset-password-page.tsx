'use client';

import Link from 'next/link';
import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';

import type { ResetPasswordPageData } from '@/lib/firebase/reset-password-data';
import { routes } from '@/lib/routes';
import { getAuthClient } from '@/lib/firebase/client';

import styles from './reset-password-page.module.css';

type ResetPasswordPageProps = {
  data: ResetPasswordPageData;
};

export function ResetPasswordPage({ data }: ResetPasswordPageProps) {
  const [identifier, setIdentifier] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = identifier.trim().toLowerCase();
    setError('');
    if (!email) {
      setError('Enter your email address first.');
      return;
    }
    setStatus('submitting');
    try {
      const auth = getAuthClient();
      if (!auth) throw new Error('Password reset is unavailable because Firebase is not configured for this web build.');
      await sendPasswordResetEmail(auth, email);
      setStatus('done');
      setIdentifier('');
    } catch (resetError) {
      setStatus('error');
      const code = resetError && typeof resetError === 'object' && 'code' in resetError ? String(resetError.code) : '';
      setError(code === 'auth/user-not-found' ? 'No account was found for that email address.' : code === 'auth/invalid-email' ? 'Enter a valid email address.' : 'Unable to send the password reset email. Check the address and try again.');
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link className={styles.brand} href={routes.home}>
            GroupTown
          </Link>
          <span className={styles.supportLabel}>{data.supportLabel}</span>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.content}>
          <Link className={styles.backLink} href={routes.login}>
            <span className="material-symbols-outlined">arrow_back</span>
            <span>{data.backLabel}</span>
          </Link>

          <div className={styles.card}>
            <div className={styles.headingBlock}>
              <h1>{data.title}</h1>
              <p>{data.description}</p>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <label className={styles.field}>
                <span>{data.identifierLabel}</span>
                <input
                  onChange={(event) => setIdentifier(event.target.value)}
                  placeholder={data.identifierPlaceholder}
                  type="text"
                  value={identifier}
                />
              </label>

              <button className={styles.submitButton} disabled={status === 'submitting'} type="submit">
                {status === 'submitting' ? 'Sending...' : data.submitLabel}
              </button>
              {error ? <p className={styles.errorMessage} role="alert">{error}</p> : null}
            </form>

            <div className={styles.cardFooter}>
              <Link className={styles.supportLink} href={routes.contact}>
                <span>{data.contactSupportLabel}</span>
                <span className="material-symbols-outlined">open_in_new</span>
              </Link>
            </div>
          </div>

          <div className={styles.contextBlock}>
            <div className={styles.ruleGrid}>
              <div />
              <div />
              <div />
            </div>
            <p>{status === 'done' ? data.contextualCaption : data.footerTagline}</p>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerCopy}>{data.footerCopyright}</div>
          <div className={styles.footerLinks}>
            <Link href={routes.privacy}>Privacy Policy</Link>
            <Link href={routes.terms}>Terms of Service</Link>
            <Link href={routes.compliance}>Security Standards</Link>
          </div>
        </div>
      </footer>

      <div className={styles.backgroundGlow}>
        <div className={styles.glowTop} />
        <div className={styles.glowBottom} />
      </div>
    </div>
  );
}
