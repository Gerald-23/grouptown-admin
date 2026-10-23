import Link from 'next/link';

import { routes } from '@/lib/routes';

import styles from './placeholder-page.module.css';

type PlaceholderPageProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PlaceholderPage({ eyebrow, title, description }: PlaceholderPageProps) {
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1>{title}</h1>
        <p className={styles.description}>{description}</p>
        <div className={styles.actions}>
          <Link className={styles.primaryAction} href={routes.home}>
            Back to home
          </Link>
          <Link className={styles.secondaryAction} href={routes.register}>
            Register
          </Link>
        </div>
      </section>
    </main>
  );
}
