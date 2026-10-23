'use client';

import Link from 'next/link';
import { useState } from 'react';

import { AuthActions } from '@/components/auth-actions';
import type { ShopPageData } from '@/lib/firebase/shop-data';
import { routes } from '@/lib/routes';

import styles from './shop-page.module.css';

type ShopPageProps = {
  data: ShopPageData;
};

export function ShopPage({ data }: ShopPageProps) {
  const [openFaq, setOpenFaq] = useState<number>(0);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={`${styles.container} ${styles.headerInner}`}>
          <Link className={styles.brand} href={routes.home}>
            GroupTown
          </Link>
          <nav className={styles.nav}>
            <Link href={routes.home}>Home</Link>
            <Link className={styles.activeLink} href={routes.programmes}>
              Programmes
            </Link>
            <Link href={routes.properties}>Properties</Link>
            <Link href={routes.howItWorks}>How It Works</Link>
            <Link href={routes.agent}>Become an AGA</Link>
            <Link href={routes.about}>About</Link>
            <Link href={routes.help}>Help</Link>
          </nav>
          <AuthActions compact />
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.heroSection}>
          <div className={`${styles.container} ${styles.heroInner}`}>
            <nav aria-label="Breadcrumb" className={styles.breadcrumbs}>
              <Link href={routes.home}>Home</Link>
              <i className="material-symbols-outlined">chevron_right</i>
              <Link href={routes.programmes}>Programmes</Link>
              <i className="material-symbols-outlined">chevron_right</i>
              <span>S.H.O.P.</span>
            </nav>
            <div className={styles.heroContent}>
              <h1>{data.heroTitle}</h1>
              <p>{data.heroDescription}</p>
              <div className={styles.heroActions}>
                <Link className={styles.primaryButtonLarge} href={routes.register}>
                  Register to get started
                </Link>
                <Link className={styles.secondaryButtonLarge} href={routes.contact}>
                  Talk to support
                </Link>
              </div>
            </div>
          </div>
          <div className={styles.heroTexture} />
        </section>

        <section className={`${styles.container} ${styles.overviewSection}`}>
          <div className={styles.overviewGrid}>
            <div>
              <h2>{data.overviewTitle}</h2>
              <p className={styles.bodyCopy}>{data.overviewDescription}</p>
              <ul className={styles.checkList}>
                {data.overviewBullets.map((item) => (
                  <li key={item}>
                    <span className="material-symbols-outlined">check_circle</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.diagramCard}>
              <div className={styles.diagramFrame}>
                <img alt="Ownership model diagram" className={styles.coverImage} src={data.overviewImage} />
                <div className={styles.diagramBadge}>Ownership Model Diagram</div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.audienceSection}>
          <div className={styles.container}>
            <h2 className={styles.centeredHeading}>Who it may suit</h2>
            <div className={styles.audienceGrid}>
              {data.audienceItems.map((item) => (
                <article key={item.title} className={styles.audienceCard}>
                  <div className={styles.audienceIcon}>
                    <span className="material-symbols-outlined">{item.icon}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={`${styles.container} ${styles.journeySection}`}>
          <h2>Your high-level journey</h2>
          <div className={styles.journeyRail}>
            <div className={styles.journeyLine} />
            {data.journeySteps.map((step, index) => (
              <article key={step.label} className={styles.journeyStep}>
                <div className={styles.journeyNumber}>{index + 1}</div>
                <p className={styles.journeyLabel}>{step.label}</p>
                <p className={styles.journeyDescription}>{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.manageSection}>
          <div className={styles.container}>
            <div className={styles.sectionIntro}>
              <div className={styles.sectionIntroCopy}>
                <h2>What you can manage</h2>
                <p>A dedicated dashboard to oversee every aspect of your collective ownership journey.</p>
              </div>
            </div>
            <div className={styles.capabilityGrid}>
              {data.capabilities.map((item) => (
                <article key={item.label} className={styles.capabilityCard}>
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span>{item.label}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={`${styles.container} ${styles.structureSection}`}>
          <h2 className={styles.centeredHeading}>Illustrative Group Structure</h2>
          <div className={styles.structureCard}>
            <div className={styles.memberGrid}>
              {Array.from({ length: data.memberCount }, (_, index) => (
                <div key={index} className={styles.memberNode}>
                  <div className={`${styles.memberAvatar} ${index === 0 ? styles.memberAvatarActive : ''}`}>
                    <span className="material-symbols-outlined">person</span>
                  </div>
                  <span>{`Member ${String(index + 1).padStart(2, '0')}`}</span>
                </div>
              ))}
            </div>
            <div className={styles.structureNote}>
              Illustrative group structure - final programme rules pending approval.
            </div>
          </div>
        </section>

        <section className={styles.documentsSection}>
          <div className={`${styles.container} ${styles.documentsGrid}`}>
            <div>
              <h2>Eligibility &amp; Documents</h2>
              <p className={styles.bodyCopy}>
                To ensure the safety and success of all participants, every applicant must meet the
                following baseline criteria and provide necessary documentation.
              </p>
              <div className={styles.noticeCard}>
                <p className={styles.noticeTitle}>
                  <span className="material-symbols-outlined">info</span>
                  IMPORTANT NOTICE
                </p>
                <p>{data.documentsNotice}</p>
              </div>
            </div>
            <div className={styles.documentList}>
              {data.documentItems.map((item) => (
                <article key={item.label} className={styles.documentRow}>
                  <span>{item.label}</span>
                  <i className="material-symbols-outlined">{item.statusIcon}</i>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={`${styles.container} ${styles.faqSection}`}>
          <h2>Frequently Asked Questions</h2>
          <div className={styles.faqList}>
            {data.faqs.map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <button
                  key={faq.question}
                  className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ''}`}
                  onClick={() => setOpenFaq(isOpen ? -1 : index)}
                  type="button">
                  <div className={styles.faqHeader}>
                    <span>{faq.question}</span>
                    <i className="material-symbols-outlined">{isOpen ? 'expand_less' : 'expand_more'}</i>
                  </div>
                  {isOpen ? <p className={styles.faqAnswer}>{faq.answer}</p> : null}
                </button>
              );
            })}
          </div>
        </section>

        <section className={styles.finalCtaSection}>
          <div className={`${styles.container} ${styles.finalCtaInner}`}>
            <h2>{data.finalCtaTitle}</h2>
            <p>{data.finalCtaDescription}</p>
            <div className={styles.heroActions}>
              <Link className={styles.lightButtonLarge} href={routes.register}>
                Start your journey
              </Link>
              <Link className={styles.outlineLightButtonLarge} href={data.brochureHref}>
                Request programme pack
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={`${styles.container} ${styles.footerGrid}`}>
          <div className={styles.footerIntro}>
            <div className={styles.footerBrand}>GroupTown</div>
            <p>
              Institutional trust and modern clarity for collective property ownership in Ghana.
            </p>
            <p>© 2024 GroupTown. All rights reserved.</p>
          </div>
          <div>
            <h4>Programmes</h4>
            <Link href={routes.shop}>S.H.O.P.</Link>
            <Link href={routes.slop}>S.L.O.P.</Link>
            <Link href={routes.agent}>AGA Rewards</Link>
          </div>
          <div>
            <h4>Company</h4>
            <Link href={routes.about}>About Us</Link>
            <Link href={routes.contact}>Contact</Link>
            <Link href={routes.help}>Support</Link>
          </div>
          <div>
            <h4>Legal</h4>
            <Link href={routes.privacy}>Privacy Policy</Link>
            <Link href={routes.terms}>Terms of Service</Link>
            <Link href={routes.compliance}>Compliance</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
