'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { useAuth } from '@/components/auth-context';
import type { RegisterPageData } from '@/lib/firebase/register-data';
import { routes } from '@/lib/routes';

import styles from './register-page.module.css';

type RegisterPageProps = {
  data: RegisterPageData;
};

export function RegisterPage({ data }: RegisterPageProps) {
  const router = useRouter();
  const { signIn } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting'>('idle');

  const passwordChecks = useMemo(
    () => ({
      minLength: password.length >= 8,
      complexity: /[0-9\W_]/.test(password),
    }),
    [password]
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!acceptTerms) {
      setError('You must accept the Terms of Service and Privacy Policy.');
      return;
    }

    setStatus('submitting');

    window.setTimeout(() => {
      signIn({ name: `${firstName} ${lastName}`.trim() || 'Alexander', role: 'Active Participant' });
      setStatus('idle');
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setConfirmPassword('');
      setAcceptTerms(false);
      setMarketing(false);
      setError('Registration UI is ready. Firebase Auth signup will be connected next.');
      router.push(routes.dashboard);
    }, 1200);
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={`${styles.container} ${styles.headerInner}`}>
          <Link className={styles.brand} href={routes.home}>
            GroupTown
          </Link>
          <nav className={styles.nav}>
            <Link href={routes.login}>Sign In</Link>
            <Link className={styles.getStartedButton} href={routes.register}>
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.formCard}>
          <div className={styles.headingBlock}>
            <h1>{data.title}</h1>
            <p>{data.subtitle}</p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.twoColGrid}>
              <label>
                <span>FIRST NAME</span>
                <input
                  onChange={(event) => setFirstName(event.target.value)}
                  required
                  type="text"
                  value={firstName}
                />
              </label>
              <label>
                <span>LAST NAME</span>
                <input
                  onChange={(event) => setLastName(event.target.value)}
                  required
                  type="text"
                  value={lastName}
                />
              </label>
            </div>

            <label>
              <span>EMAIL ADDRESS</span>
              <input
                onChange={(event) => setEmail(event.target.value)}
                placeholder="example@grouptown.com"
                required
                type="email"
                value={email}
              />
            </label>

            <label>
              <span>PHONE NUMBER</span>
              <div className={styles.phoneRow}>
                <div className={styles.phonePrefix}>
                  <img alt="Ghana Flag" src={data.phoneFlagImage} />
                  <span>{data.phonePrefix}</span>
                </div>
                <input
                  onChange={(event) => setPhone(event.target.value)}
                  required
                  type="tel"
                  value={phone}
                />
              </div>
            </label>

            <label>
              <span>PASSWORD</span>
              <input
                onChange={(event) => setPassword(event.target.value)}
                required
                type="password"
                value={password}
              />
            </label>

            <label>
              <span>CONFIRM PASSWORD</span>
              <input
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                type="password"
                value={confirmPassword}
              />
            </label>

            <div className={styles.passwordCard}>
              <p>Security Requirements</p>
              <div className={styles.passwordCheck}>
                <span className="material-symbols-outlined">
                  {passwordChecks.minLength ? 'check_circle' : 'radio_button_unchecked'}
                </span>
                <span>{data.passwordChecklist[0]}</span>
              </div>
              <div className={styles.passwordCheck}>
                <span className="material-symbols-outlined">
                  {passwordChecks.complexity ? 'check_circle' : 'radio_button_unchecked'}
                </span>
                <span>{data.passwordChecklist[1]}</span>
              </div>
            </div>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxRow}>
                <input
                  checked={acceptTerms}
                  onChange={(event) => setAcceptTerms(event.target.checked)}
                  required
                  type="checkbox"
                />
                <span>
                  I agree to the <Link href={routes.terms}>Terms of Service</Link> and{' '}
                  <Link href={routes.privacy}>Privacy Policy</Link>.
                </span>
              </label>
              <label className={styles.checkboxRow}>
                <input
                  checked={marketing}
                  onChange={(event) => setMarketing(event.target.checked)}
                  type="checkbox"
                />
                <span>{data.marketingLabel}</span>
              </label>
            </div>

            {error ? <p className={styles.errorText}>{error}</p> : null}

            <button className={styles.submitButton} disabled={status === 'submitting'} type="submit">
              <span>{status === 'submitting' ? 'Creating Account...' : data.submitLabel}</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </form>

          <div className={styles.agaCallout}>
            <div className={styles.agaIconWrap}>
              <span className="material-symbols-outlined">verified_user</span>
            </div>
            <div>
              <p className={styles.agaTitle}>{data.agaTitle}</p>
              <p className={styles.agaDescription}>{data.agaDescription}</p>
              <Link className={styles.agaLink} href={routes.agent}>
                Learn about the application process
              </Link>
            </div>
          </div>
        </div>

        <p className={styles.loginPrompt}>
          Already have an account? <Link href={routes.login}>Log in</Link>
        </p>
      </main>

      <footer className={styles.footer}>
        <div className={`${styles.container} ${styles.footerInner}`}>
          <div className={styles.footerBrandBlock}>
            <div className={styles.footerBrand}>GroupTown Ghana</div>
            <div>© 2024 GroupTown Ghana. All rights reserved.</div>
          </div>
          <div className={styles.footerLinks}>
            <Link href={routes.terms}>Terms of Service</Link>
            <Link href={routes.privacy}>Privacy Policy</Link>
            <Link href={routes.legal}>Legal Documentation</Link>
            <Link href={routes.contact}>Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
