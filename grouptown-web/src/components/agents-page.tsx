import Link from 'next/link';

import type { AgentsPageData } from '@/lib/firebase/agents-data';
import { routes } from '@/lib/routes';

import styles from './agents-page.module.css';

type AgentsPageProps = {
  data: AgentsPageData;
};

export function AgentsPage({ data }: AgentsPageProps) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={`${styles.container} ${styles.headerInner}`}>
          <Link className={styles.brand} href={routes.home}>
            GroupTown
          </Link>
          <nav className={styles.nav}>
            <Link href={routes.home}>Home</Link>
            <Link href={routes.programmes}>Programmes</Link>
            <Link href={routes.properties}>Properties</Link>
            <Link className={styles.activeLink} href={routes.agent}>
              Become an AGA
            </Link>
          </nav>
          <div className={styles.headerActions}>
            <Link className={styles.primaryButton} href={routes.login}>
              Sign In
            </Link>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.heroSection}>
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div className={styles.heroContent}>
              <span className={styles.eyebrow}>{data.heroEyebrow}</span>
              <h1>{data.heroTitle}</h1>
              <p>{data.heroDescription}</p>
              <div className={styles.heroActions}>
                <Link className={styles.darkButton} href={routes.register}>
                  Start AGA application
                </Link>
                <Link className={styles.outlineButton} href={routes.login}>
                  Already have an account? Log in.
                </Link>
              </div>
            </div>

            <div className={styles.heroImageWrap}>
              <div className={styles.heroImageAccent} />
              <div className={styles.heroImageFrame}>
                <img alt="Accredited GroupTown Agent network" src={data.heroImage} />
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.centerHeading}>
              <h2>Core Responsibilities</h2>
              <div className={styles.headingRule} />
            </div>
            <div className={styles.responsibilityGrid}>
              {data.responsibilities.map((item) => (
                <article
                  key={item.title}
                  className={`${styles.responsibilityCard} ${
                    item.featured ? styles.featuredResponsibility : ''
                  }`}>
                  <span className={`material-symbols-outlined ${styles.cardIcon}`}>
                    {item.icon}
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  {item.featured ? (
                    <div className={styles.featuredIcon}>
                      <span className="material-symbols-outlined">sync</span>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.mutedSection}>
          <div className={styles.container}>
            <div className={styles.leftHeading}>
              <h2>{data.accreditationTitle}</h2>
              <p>{data.accreditationDescription}</p>
            </div>
            <div className={styles.timelineGrid}>
              {data.accreditationSteps.map((step) => (
                <article
                  key={step.number}
                  className={`${styles.timelineCard} ${
                    step.highlighted ? styles.timelineCardActive : ''
                  }`}>
                  <div className={styles.timelineNumber}>{step.number}</div>
                  <h4>{step.title}</h4>
                  <p>{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={`${styles.container} ${styles.splitGrid}`}>
            <div>
              <h2>{data.eligibilityTitle}</h2>
              <ul className={styles.requirementList}>
                {data.eligibilityItems.map((item) => (
                  <li key={item.title}>
                    <span className="material-symbols-outlined">{item.icon}</span>
                    <div>
                      <h4>{item.title}</h4>
                      <p>{item.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <aside className={styles.territoryCard}>
              <h2>{data.territoryTitle}</h2>
              <p>{data.territoryDescription}</p>
              <div className={styles.infoNote}>
                <span className="material-symbols-outlined">info</span>
                <span>{data.territoryNote}</span>
              </div>
            </aside>
          </div>
        </section>

        <section className={styles.workspaceSection}>
          <div className={styles.container}>
            <div className={styles.centerHeading}>
              <h2>{data.workspaceTitle}</h2>
              <p>{data.workspaceDescription}</p>
            </div>

            <div className={styles.workspaceCard}>
              <div className={styles.workspaceTopbar}>
                <div className={styles.workspaceIdentity}>
                  <div className={styles.workspaceAvatar} />
                  <span>AGA Portal — Accra Central</span>
                </div>
                <div className={styles.workspaceDots}>
                  <span />
                  <span />
                </div>
              </div>

              <div className={styles.workspaceBody}>
                <aside className={styles.workspaceSidebar}>
                  <div />
                  <div />
                  <div className={styles.workspaceSidebarActive} />
                  <div />
                </aside>

                <div className={styles.workspaceMain}>
                  <div className={styles.workspaceStats}>
                    {data.workspaceStats.map((item) => (
                      <div key={item.label} className={styles.workspaceStatCard}>
                        <span>{item.label}</span>
                        <strong>{item.value}</strong>
                      </div>
                    ))}
                  </div>

                  <div className={styles.workspaceRows}>
                    <div />
                    <div />
                    <div />
                  </div>
                </div>
              </div>
            </div>

            <p className={styles.workspaceDisclaimer}>{data.workspaceDisclaimer}</p>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.narrowContainer}>
            <h2 className={styles.faqHeading}>Frequently Asked Questions</h2>
            <div className={styles.faqList}>
              {data.faqs.map((item) => (
                <details key={item.question} className={styles.faqItem}>
                  <summary>
                    <span>{item.question}</span>
                    <span className="material-symbols-outlined">expand_more</span>
                  </summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.finalCta}>
          <div className={styles.narrowContainer}>
            <h2>{data.finalCtaTitle}</h2>
            <p>{data.finalCtaDescription}</p>
            <Link className={styles.lightButton} href={routes.register}>
              Start Your Application
            </Link>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={`${styles.container} ${styles.footerGrid}`}>
          <div>
            <div className={styles.footerBrand}>GroupTown</div>
            <p>
              © 2024 GroupTown Ghana. All rights reserved. Institutional Property Management
              & Legal Verification.
            </p>
          </div>
          <div>
            <h5>Directory</h5>
            <Link href={routes.slop}>S.L.O.P. Directory</Link>
            <Link href={routes.shop}>S.H.O.P. Directory</Link>
          </div>
          <div>
            <h5>Network</h5>
            <Link href={routes.agent}>Become an AGA</Link>
            <Link href={routes.careers}>Recruitment</Link>
          </div>
          <div>
            <h5>Legal</h5>
            <Link href={routes.privacy}>Privacy Policy</Link>
            <Link href={routes.terms}>Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
