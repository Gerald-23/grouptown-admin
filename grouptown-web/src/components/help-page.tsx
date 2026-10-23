'use client';

import Link from 'next/link';
import { useState } from 'react';

import type { HelpPageData } from '@/lib/firebase/help-data';
import { routes } from '@/lib/routes';

import styles from './help-page.module.css';

type HelpPageProps = {
  data: HelpPageData;
};

export function HelpPage({ data }: HelpPageProps) {
  const [openQuestion, setOpenQuestion] = useState(data.faqs[0]?.question ?? '');

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={`${styles.container} ${styles.headerInner}`}>
          <div className={styles.headerLeft}>
            <Link className={styles.brand} href={routes.home}>
              GroupTown
            </Link>
            <nav className={styles.nav}>
              <Link href={routes.properties}>Properties</Link>
              <Link href={routes.programmes}>Invest</Link>
              <Link href={routes.shop}>S.H.O.P.</Link>
              <Link href={routes.slop}>S.L.O.P.</Link>
              <Link className={styles.activeLink} href={routes.help}>
                Help
              </Link>
            </nav>
          </div>

          <div className={styles.headerActions}>
            <div className={styles.quickSearchWrap}>
              <span className="material-symbols-outlined">search</span>
              <input placeholder={data.popularTopicsLabel} type="text" />
            </div>
            <Link className={styles.primaryButton} href={routes.login}>
              Sign In
            </Link>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.heroSection}>
          <div className={styles.narrowContainer}>
            <h1>{data.heroTitle}</h1>
            <div className={styles.searchHero}>
              <span className="material-symbols-outlined">search</span>
              <input placeholder={data.quickSearchPlaceholder} type="text" />
            </div>
            <p>{data.heroSubtitle}</p>
          </div>
        </section>

        <section className={styles.categorySection}>
          <div className={styles.container}>
            <div className={styles.categoryGrid}>
              {data.categories.map((item) => (
                <Link key={item.title} className={styles.categoryCard} href={item.href}>
                  <span className={`material-symbols-outlined ${styles.categoryIcon}`}>
                    {item.icon}
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.contentSection}>
          <div className={`${styles.container} ${styles.contentGrid}`}>
            <div className={styles.faqPanel}>
              <h2>{data.faqTitle}</h2>
              <div className={styles.accordionList}>
                {data.faqs.map((item) => {
                  const isOpen = openQuestion === item.question;
                  return (
                    <div
                      key={item.question}
                      className={`${styles.accordionItem} ${isOpen ? styles.accordionOpen : ''}`}>
                      <button
                        className={styles.accordionButton}
                        onClick={() =>
                          setOpenQuestion((current) => (current === item.question ? '' : item.question))
                        }
                        type="button">
                        <span>{item.question}</span>
                        <span className={`material-symbols-outlined ${styles.arrowIcon}`}>
                          expand_more
                        </span>
                      </button>
                      {isOpen ? (
                        <div className={styles.accordionContent}>
                          <div>{item.answer}</div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>

            <aside className={styles.sidebar}>
              <div className={styles.relatedCard}>
                <h4>Related Questions</h4>
                <ul>
                  {data.relatedQuestions.map((item) => (
                    <li key={item.title}>
                      <Link href={item.href}>
                        <span className="material-symbols-outlined">article</span>
                        <span>{item.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.supportCard}>
                <h4>{data.supportTitle}</h4>
                <p>{data.supportDescription}</p>
                <div className={styles.supportActions}>
                  <Link className={styles.supportButton} href={routes.contact}>
                    <span className="material-symbols-outlined">mail</span>
                    Contact Support
                  </Link>
                  <Link className={styles.ticketLink} href={routes.login}>
                    {data.supportHours}
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className={styles.trustSection}>
          <div className={`${styles.container} ${styles.trustGrid}`}>
            <div className={styles.trustImageWrap}>
              <img alt="GroupTown support environment" src={data.supportImage} />
            </div>
            <div className={styles.trustCopy}>
              <h2>{data.trustTitle}</h2>
              <p>{data.trustDescription}</p>
              <div className={styles.trustItems}>
                {data.trustItems.map((item) => (
                  <div key={item} className={styles.trustItem}>
                    <span className="material-symbols-outlined">
                      {item === 'Verified Content' ? 'verified' : 'gavel'}
                    </span>
                    <span>{item.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={`${styles.container} ${styles.footerGrid}`}>
          <div className={styles.footerBrandBlock}>
            <div className={styles.footerBrand}>GroupTown</div>
            <p>© 2024 GroupTown Ghana. All rights reserved. Institutional grade property ownership.</p>
          </div>
          <div className={styles.footerLinks}>
            <Link href={routes.legal}>Legal</Link>
            <Link href={routes.privacy}>Privacy Policy</Link>
            <Link href={routes.terms}>Terms of Service</Link>
            <Link href={routes.contact}>Contact Support</Link>
            <Link href={routes.careers}>Careers</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
