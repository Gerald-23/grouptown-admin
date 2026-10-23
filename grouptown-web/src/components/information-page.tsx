import Link from 'next/link';

import { routes } from '@/lib/routes';

import styles from './information-page.module.css';

type InformationSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

type InformationMeta = {
  label: string;
  value: string;
};

type InformationPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: InformationSection[];
  meta?: InformationMeta[];
};

export function InformationPage({
  eyebrow,
  title,
  intro,
  sections,
  meta = [],
}: InformationPageProps) {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.intro}>{intro}</p>
          <div className={styles.actions}>
            <Link className={styles.primaryAction} href={routes.contact}>
              Contact support
            </Link>
            <Link className={styles.secondaryAction} href={routes.home}>
              Back to home
            </Link>
          </div>
        </section>

        <div className={styles.contentGrid}>
          <div className={styles.mainColumn}>
            {sections.map((section) => (
              <section key={section.title} className={styles.card}>
                <h2 className={styles.cardTitle}>{section.title}</h2>
                {section.paragraphs?.length ? (
                  <div className={styles.paragraphs}>
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph} className={styles.paragraph}>
                        {paragraph}
                      </p>
                    ))}
                  </div>
                ) : null}
                {section.bullets?.length ? (
                  <ul className={styles.list}>
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>

          {meta.length ? (
            <aside className={styles.sideColumn}>
              <section className={styles.card}>
                <h2 className={styles.cardTitle}>Quick Reference</h2>
                <div className={styles.metaList}>
                  {meta.map((item) => (
                    <div key={`${item.label}-${item.value}`} className={styles.metaRow}>
                      <div className={styles.metaLabel}>{item.label}</div>
                      <div className={styles.metaValue}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </section>
            </aside>
          ) : null}
        </div>
      </div>
    </main>
  );
}
