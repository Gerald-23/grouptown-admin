'use client';

import Link from 'next/link';

import { AuthActions } from '@/components/auth-actions';
import type { SlopPageData } from '@/lib/firebase/slop-data';
import { routes } from '@/lib/routes';

import styles from './slop-page.module.css';

type SlopPageProps = {
  data: SlopPageData;
};

export function SlopPage({ data }: SlopPageProps) {
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
            <Link href={routes.about}>About</Link>
          </nav>
          <AuthActions compact />
        </div>
      </header>

      <main className={styles.main}>
        <section className={`${styles.container} ${styles.heroSection}`}>
          <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
            <Link href={routes.home}>Home</Link>
            <span className="material-symbols-outlined">chevron_right</span>
            <Link href={routes.programmes}>Programmes</Link>
            <span className="material-symbols-outlined">chevron_right</span>
            <span className={styles.breadcrumbActive}>S.L.O.P.</span>
          </nav>
          <div className={styles.heroGrid}>
            <div>
              <h1>{data.heroTitle}</h1>
              <p className={styles.heroCopy}>{data.heroDescription}</p>
              <div className={styles.heroActions}>
                <Link className={styles.primaryButtonLarge} href={routes.register}>
                  Register to get started
                </Link>
                <Link className={styles.secondaryButtonLarge} href={routes.contact}>
                  Ask a question
                </Link>
              </div>
            </div>
            <div className={styles.heroImageWrap}>
              <img alt="S.L.O.P. land reserve" className={styles.coverImage} src={data.heroImage} />
            </div>
          </div>
        </section>

        <section className={`${styles.container} ${styles.overviewSection}`}>
          <div className={styles.overviewCopy}>
            <h2>{data.overviewTitle}</h2>
            <div className={styles.overviewParagraphs}>
              {data.overviewParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <div className={styles.complianceCard}>
              <p className={styles.complianceTitle}>{data.complianceTitle}</p>
              <p>{data.complianceDescription}</p>
            </div>
          </div>
        </section>

        <section className={`${styles.container} ${styles.audienceSection}`}>
          <h2 className={styles.sectionHeading}>Strategic Alignment</h2>
          <div className={styles.audienceGrid}>
            {data.audienceItems.map((item) => (
              <article key={item.title} className={styles.audienceCard}>
                <span className={`material-symbols-outlined ${styles.audienceIcon}`}>{item.icon}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.timelineSection}>
          <div className={styles.container}>
            <h2 className={styles.sectionHeadingCentered}>Your Pathway to Ownership</h2>
            <div className={styles.timelineRail}>
              <div className={styles.timelineLine} />
              <div className={styles.timelineGrid}>
                {data.journeySteps.map((step, index) => (
                  <article key={step.label} className={styles.timelineStep}>
                    <div className={`${styles.timelineNumber} ${index === 0 ? styles.timelineActive : ''}`}>
                      {index + 1}
                    </div>
                    <h4>{step.label}</h4>
                    <p>{step.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className={`${styles.container} ${styles.opportunitiesSection}`}>
          <div className={styles.sectionRow}>
            <h2 className={styles.sectionHeading}>{data.opportunitiesTitle}</h2>
            <Link className={styles.inlineLink} href={routes.properties}>
              View all opportunities
            </Link>
          </div>
          <div className={styles.opportunityGrid}>
            {data.opportunities.map((item) => (
              <article key={item.title} className={styles.opportunityCard}>
                <div className={styles.opportunityImageWrap}>
                  <img alt={item.title} className={styles.opportunityImage} src={item.image} />
                  <span className={styles.statusBadge}>{item.status}</span>
                </div>
                <div className={styles.opportunityBody}>
                  <h3>{item.title}</h3>
                  <p>{item.subtitle}</p>
                  <div className={styles.opportunityFooter}>
                    <span>{`Type: ${item.type}`}</span>
                    <Link href={item.href}>Details</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={`${styles.container} ${styles.capabilitiesSection}`}>
          <h2 className={styles.sectionHeading}>{data.capabilitiesTitle}</h2>
          <p className={styles.sectionDescription}>{data.capabilitiesDescription}</p>
          <div className={styles.capabilityGrid}>
            {data.capabilities.map((item) => (
              <article key={item.title} className={styles.capabilityCard}>
                <span className={`material-symbols-outlined ${styles.capabilityIcon}`}>{item.icon}</span>
                <div>
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={`${styles.container} ${styles.eligibilitySection}`}>
          <div className={styles.eligibilityGrid}>
            <div className={styles.eligibilityCard}>
              <h2>Eligibility &amp; Documents</h2>
              <ul className={styles.eligibilityList}>
                {data.eligibilityItems.map((item) => (
                  <li key={item.label}>
                    <span className="material-symbols-outlined">check_circle</span>
                    <span>{item.label}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.noticePanel}>
              <div className={styles.noticeHeader}>
                <span className="material-symbols-outlined">verified_user</span>
                <h2>{data.noticeTitle}</h2>
              </div>
              <p>{data.noticeDescription}</p>
              <p className={styles.noticeFootnote}>{data.noticeFootnote}</p>
            </div>
          </div>
        </section>

        <section className={`${styles.container} ${styles.faqSection}`}>
          <h2 className={styles.sectionHeadingCentered}>Frequently Asked Questions</h2>
          <div className={styles.faqList}>
            {data.faqs.map((faq) => (
              <details key={faq.question} className={styles.faqItem}>
                <summary>
                  {faq.question}
                  <span className="material-symbols-outlined">expand_more</span>
                </summary>
                <div>{faq.answer}</div>
              </details>
            ))}
          </div>
        </section>

        <section className={`${styles.container} ${styles.finalCtaSection}`}>
          <div className={styles.finalCtaCard}>
            <h2>{data.finalCtaTitle}</h2>
            <p>{data.finalCtaDescription}</p>
            <Link className={styles.primaryButtonXLarge} href={routes.register}>
              Register Now
            </Link>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={`${styles.container} ${styles.footerGrid}`}>
          <div>
            <div className={styles.footerBrand}>GroupTown</div>
            <p>Institutionalizing property ownership through collective intelligence.</p>
          </div>
          <div>
            <h4>Programmes</h4>
            <Link href={routes.slop}>S.L.O.P.</Link>
            <Link href={routes.shop}>S.H.O.P.</Link>
            <Link href={routes.programmes}>Compare programmes</Link>
          </div>
          <div>
            <h4>Company</h4>
            <Link href={routes.about}>About Us</Link>
            <Link href={routes.howItWorks}>How It Works</Link>
            <Link href={routes.careers}>Careers</Link>
          </div>
          <div>
            <h4>Support</h4>
            <Link href={routes.help}>Help Center</Link>
            <Link href={routes.contact}>Contact</Link>
            <Link href={routes.compliance}>Compliance</Link>
          </div>
          <div>
            <h4>Legal</h4>
            <Link href={routes.privacy}>Privacy Policy</Link>
            <Link href={routes.terms}>Terms of Service</Link>
            <Link href={routes.amlCompliance}>AML Compliance</Link>
          </div>
        </div>
        <div className={`${styles.container} ${styles.footerBottom}`}>
          <span>© 2024 GroupTown. All rights reserved.</span>
          <div className={styles.footerIcons}>
            <span className="material-symbols-outlined">public</span>
            <span className="material-symbols-outlined">share</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
