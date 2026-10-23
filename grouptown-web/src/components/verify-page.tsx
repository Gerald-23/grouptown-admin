'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/components/auth-context';
import type { VerifyPageData } from '@/lib/firebase/verify-data';
import { routes } from '@/lib/routes';

import styles from './verify-page.module.css';

type VerifyPageProps = {
  data: VerifyPageData;
};

export function VerifyPage({ data }: VerifyPageProps) {
  const router = useRouter();
  const { signIn } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(data.countdownStartSeconds);
  const [resendEnabled, setResendEnabled] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      setResendEnabled(true);
      return;
    }

    const timer = window.setTimeout(() => setTimeLeft((current) => current - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [timeLeft]);

  const countdown = useMemo(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, [timeLeft]);

  function updateOtp(index: number, value: string) {
    const next = value.replace(/\D/g, '').slice(0, 1);
    setOtp((current) => current.map((item, itemIndex) => (itemIndex === index ? next : item)));
  }

  function handleVerify() {
    setSubmitting(true);
    window.setTimeout(() => {
      signIn({ name: 'Alexander', role: 'Active Participant' });
      router.push(routes.dashboard);
    }, 1200);
  }

  function handleResend() {
    setResendEnabled(false);
    setTimeLeft(data.countdownStartSeconds);
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={`${styles.container} ${styles.headerInner}`}>
          <span className={styles.brand}>GroupTown</span>
          <div className={styles.headerActions}>
            <Link className={styles.signInLink} href={routes.login}>
              Sign In
            </Link>
            <Link className={styles.helpLink} href={routes.help}>
              <span className="material-symbols-outlined">help_outline</span>
            </Link>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.authCard}>
          <div className={styles.iconWrap}>
            <span className="material-symbols-outlined">verified_user</span>
          </div>

          <div className={styles.headingBlock}>
            <h1>{data.title}</h1>
            <p>{data.subtitle}</p>
          </div>

          <div className={styles.formBlock}>
            <div className={styles.otpRow}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  className={styles.otpInput}
                  inputMode="numeric"
                  maxLength={1}
                  onChange={(event) => updateOtp(index, event.target.value)}
                  type="text"
                  value={digit}
                />
              ))}
            </div>

            <div className={styles.timerBlock}>
              <div className={styles.countdownRow}>
                <span className="material-symbols-outlined">schedule</span>
                <span>{countdown}</span>
              </div>
              <div className={styles.helperActions}>
                <button
                  className={resendEnabled ? styles.resendActive : styles.resendIdle}
                  disabled={!resendEnabled}
                  onClick={handleResend}
                  type="button">
                  {data.resendLabel}
                </button>
                <div className={styles.dot} />
                <Link href={routes.register}>{data.changePhoneLabel}</Link>
              </div>
            </div>

            <div className={styles.submitBlock}>
              <button className={styles.verifyButton} onClick={handleVerify} type="button">
                {submitting ? (
                  <span className={`material-symbols-outlined ${styles.spinner}`}>
                    progress_activity
                  </span>
                ) : (
                  data.verifyLabel
                )}
              </button>
              <p>Routes to User Dashboard upon successful verification</p>
            </div>
          </div>

          <div className={styles.footnote}>
            <p>{data.footnote}</p>
          </div>
        </div>
      </main>

      <div className={styles.backgroundGlow}>
        <div className={styles.glowTop} />
        <div className={styles.glowBottom} />
      </div>

      <footer className={styles.footer}>
        <div className={`${styles.container} ${styles.footerInner}`}>
          <div className={styles.footerBrandBlock}>
            <div className={styles.footerBrand}>GroupTown Ghana</div>
            <div>© 2024 GroupTown Ghana. All rights reserved.</div>
          </div>
          <div className={styles.footerLinks}>
            <Link href={routes.terms}>Terms of Service</Link>
            <Link href={routes.privacy}>Privacy Policy</Link>
            <Link href={routes.contact}>Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
