'use client';

import Link from 'next/link';
import { useState } from 'react';

import { AuthActions } from '@/components/auth-actions';
import type { ProgrammeDirectoryCard, ProgrammeFaqItem } from '@/lib/firebase/programmes-data';
import { routes } from '@/lib/routes';

import styles from './programmes-page.module.css';

const guideCards = [
  {
    icon: 'schedule',
    title: 'What is your timeline?',
    description:
      'Are you looking for immediate occupancy or are you planning for a 5-10 year development horizon?',
  },
  {
    icon: 'family_restroom',
    title: 'Who is this for?',
    description:
      'Is the primary goal a secure roof for your family or a strategic asset for your personal portfolio?',
  },
  {
    icon: 'account_balance_wallet',
    title: 'Asset Type?',
    description:
      'Do you prefer the utility of a completed structure or the raw potential of strategically located land?',
  },
] as const;

type ProgrammesPageProps = {
  cards: ProgrammeDirectoryCard[];
  faqs: ProgrammeFaqItem[];
};

export function ProgrammesPage({ cards, faqs }: ProgrammesPageProps) {
  const [openFaqs, setOpenFaqs] = useState<number[]>([]);

  function toggleFaq(index: number) {
    setOpenFaqs((current) =>
      current.includes(index) ? current.filter((item) => item !== index) : [...current, index]
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <nav className={`${styles.container} ${styles.navbar}`}>
          <Link className={styles.brand} href={routes.home}>
            GroupTown
          </Link>
          <div className={styles.navLinks}>
            <Link href={routes.home}>Home</Link>
            <Link className={styles.activeLink} href={routes.programmes}>
              Programmes
            </Link>
            <Link href={routes.properties}>Properties</Link>
            <Link href={routes.howItWorks}>How It Works</Link>
            <Link href={routes.agent}>Become an AGA</Link>
            <Link href={routes.about}>About</Link>
            <Link href={routes.help}>Help</Link>
          </div>
          <AuthActions compact />
        </nav>
      </header>

      <main className={`${styles.container} ${styles.main}`}>
        <section className={styles.hero}>
          <nav aria-label="Breadcrumb" className={styles.breadcrumbs}>
            <Link href={routes.home}>Home</Link>
            <span>Programmes</span>
          </nav>
          <h1>Programme Directory</h1>
          <p className={styles.heroCopy}>
            Choose the programme that matches your goal.
            <span className={styles.heroNote}>
              Note: Final terms and eligibility are confirmed during the official application
              process.
            </span>
          </p>
        </section>

        <section className={styles.comparisonGrid}>
          {cards.map((card) => (
            <article key={card.slug} className={styles.programmeCard}>
              <div className={styles.cardImageWrap}>
                <div
                  className={styles.cardImage}
                  style={{
                    backgroundImage: `url('${card.image}')`,
                  }}
                />
                <div className={styles.cardLabel}>{card.label}</div>
              </div>
              <div className={styles.cardBody}>
                <h2>{card.title}</h2>
                <div className={styles.metaBlock}>
                  <span>Goal</span>
                  <p>{card.goal}</p>
                </div>
                <div className={styles.metaBlock}>
                  <span>Suitability</span>
                  <p>{card.suitability}</p>
                </div>
                <div className={styles.journey}>
                  <span>The Journey</span>
                  <div className={styles.journeyRow}>
                    {card.journeySteps.map((step, index) => (
                      <span key={`${card.slug}-${step}-${index}`} className={styles.journeyStep}>
                        {index > 0 ? (
                          <i className="material-symbols-outlined">chevron_right</i>
                        ) : null}
                        {index === card.journeySteps.length - 1 ? <strong>{step}</strong> : <span>{step}</span>}
                      </span>
                    ))}
                  </div>
                </div>
                <Link
                  className={card.variant === 'solid' ? styles.primaryCta : styles.secondaryCta}
                  href={card.href}>
                  {card.cta}
                </Link>
              </div>
            </article>
          ))}
        </section>

        <section className={styles.chooserSection}>
          <div className={styles.chooserHeader}>
            <h2>How to Choose</h2>
            <p>
              Consider these neutral questions to help align your choice with your current
              objectives.
            </p>
          </div>
          <div className={styles.guideGrid}>
            {guideCards.map((card) => (
              <article key={card.title} className={styles.guideCard}>
                <i className="material-symbols-outlined">{card.icon}</i>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.faqSection}>
          <div className={styles.sectionHeader}>
            <div>
              <h2>Common Questions</h2>
              <p>Quick answers about our programmes.</p>
            </div>
            <Link className={styles.inlineLink} href={routes.faq}>
              View all FAQ
            </Link>
          </div>
          <div className={styles.faqList}>
            {faqs.map((faq, index) => {
              const isOpen = openFaqs.includes(index);

              return (
                <button
                  key={faq.question}
                  className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ''}`}
                  onClick={() => toggleFaq(index)}
                  type="button">
                  <span className={styles.faqQuestion}>{faq.question}</span>
                  <i className="material-symbols-outlined">{isOpen ? 'remove' : 'add'}</i>
                  {isOpen && faq.answer ? <span className={styles.faqAnswer}>{faq.answer}</span> : null}
                </button>
              );
            })}
          </div>
        </section>

        <section className={styles.finalCta}>
          <h2>Ready to begin your journey?</h2>
          <p>
            Register your account to view available groups and start the verification process
            today.
          </p>
          <div className={styles.finalActions}>
            <Link className={styles.registerLink} href={routes.register}>
              Register Account
            </Link>
            <Link className={styles.supportLink} href={routes.contact}>
              Contact Support
            </Link>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerGrid}>
            <div className={styles.footerIntro}>
              <div className={styles.footerBrand}>GroupTown</div>
              <p>
                Building trust through collective ownership in the Ghanaian property market.
                Secure, transparent, and grounded.
              </p>
            </div>
            <div>
              <span className={styles.footerHeading}>Programmes</span>
              <Link href={routes.shop}>S.H.O.P.</Link>
              <Link href={routes.slop}>S.L.O.P.</Link>
              <Link href={routes.programmes}>Comparison</Link>
            </div>
            <div>
              <span className={styles.footerHeading}>Company</span>
              <Link href={routes.about}>About Us</Link>
              <Link href={routes.about}>Careers</Link>
              <Link href={routes.about}>News</Link>
            </div>
            <div>
              <span className={styles.footerHeading}>Support</span>
              <Link href={routes.help}>Help Centre</Link>
              <Link href={routes.contact}>Contact</Link>
              <Link href={routes.privacy}>Privacy Policy</Link>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p>© 2024 GroupTown. All rights reserved.</p>
            <div className={styles.footerIcons}>
              <i className="material-symbols-outlined">language</i>
              <i className="material-symbols-outlined">shield_with_heart</i>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
