import Link from 'next/link';

import { AuthActions } from '@/components/auth-actions';
import type { AboutPageData } from '@/lib/firebase/about-data';
import { routes } from '@/lib/routes';

import styles from './about-page.module.css';

type AboutPageProps = {
  data: AboutPageData;
};

export function AboutPage({ data }: AboutPageProps) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={`${styles.container} ${styles.headerInner}`}>
          <Link className={styles.brand} href={routes.home}>
            GroupTown
          </Link>
          <nav className={styles.nav}>
            <Link href={routes.shop}>S.H.O.P.</Link>
            <Link href={routes.slop}>S.L.O.P.</Link>
            <Link href={routes.properties}>Properties</Link>
            <Link className={styles.activeLink} href={routes.about}>
              About
            </Link>
          </nav>
          <AuthActions />
        </div>
      </header>

      <main>
        <section className={styles.heroSection}>
          <div
            className={styles.heroImage}
            style={{ backgroundImage: `url('${data.heroImage}')` }}
          />
          <div className={styles.heroOverlay} />
          <div className={`${styles.container} ${styles.heroContent}`}>
            <div className={styles.heroCopy}>
              <h1>{data.heroTitle}</h1>
              <div className={styles.heroRule} />
            </div>
          </div>
        </section>

        <section className={styles.missionSection}>
          <div className={`${styles.container} ${styles.missionGrid}`}>
            <div>
              <span className={styles.sectionLabel}>{data.missionLabel}</span>
            </div>
            <div>
              <p className={styles.missionText}>{data.missionText}</p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <h2 className={styles.centerHeading}>{data.ecosystemTitle}</h2>
            <div className={styles.ecosystemGrid}>
              {data.ecosystemItems.map((item) => (
                <article key={item.title} className={styles.ecosystemCard}>
                  <div className={styles.iconBox}>
                    <span className="material-symbols-outlined">{item.icon}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.modelSection}>
          <div className={styles.container}>
            <div className={styles.modelCard}>
              <h2>{data.operatingTitle}</h2>
              <div className={styles.modelGrid}>
                {data.operatingSteps.map((step) => (
                  <article key={step.number} className={styles.modelStep}>
                    <div className={styles.stepNumber}>{step.number}</div>
                    <h4>{step.title}</h4>
                    <p>{step.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className={styles.partnershipSection}>
          <div className={`${styles.container} ${styles.partnershipGrid}`}>
            <div className={styles.partnershipImageWrap}>
              <div
                className={styles.partnershipImage}
                style={{ backgroundImage: `url('${data.partnershipImage}')` }}
              />
            </div>
            <div className={styles.partnershipCopy}>
              <span className={styles.sectionLabel}>{data.partnershipLabel}</span>
              <h2>{data.partnershipTitle}</h2>
              <div className={styles.partnershipText}>
                {data.partnershipParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <h2 className={styles.centerHeading}>{data.pillarsTitle}</h2>
            <div className={styles.pillarGrid}>
              {data.pillars.map((pillar) => (
                <article key={pillar.title} className={styles.pillarCard}>
                  <h3>{pillar.title}</h3>
                  <p>{pillar.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.pathwaysSection}>
          <div className={styles.container}>
            <h2>{data.pathwaysTitle}</h2>
            <div className={styles.pathwayGrid}>
              {data.pathways.map((pathway) => (
                <Link key={pathway.title} className={styles.pathwayCard} href={pathway.href}>
                  <h4>{pathway.title}</h4>
                  <p>{pathway.description}</p>
                  <span className={`material-symbols-outlined ${styles.arrowIcon}`}>
                    arrow_forward
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.finalCta}>
          <div className={styles.narrowContainer}>
            <h2>{data.finalCtaTitle}</h2>
            <p>{data.finalCtaDescription}</p>
            <Link className={styles.lightButton} href={routes.contact}>
              Contact Support
            </Link>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={`${styles.container} ${styles.footerGrid}`}>
          <div>
            <div className={styles.footerBrand}>GroupTown</div>
            <p>
              © 2024 GroupTown. All rights reserved. Professional excellence in Ghanaian
              property ownership.
            </p>
          </div>
          <div className={styles.footerLinks}>
            <div>
              <Link href={routes.privacy}>Privacy Policy</Link>
              <Link href={routes.terms}>Terms of Service</Link>
            </div>
            <div>
              <Link href={routes.legal}>Legal Documentation</Link>
              <Link href={routes.contact}>Contact Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
