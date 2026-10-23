'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { AuthActions } from '@/components/auth-actions';
import type { ProgrammeItem, PropertyItem } from '@/lib/firebase/landing-data';
import { routes } from '@/lib/routes';
import { sharedImages } from '@/lib/shared-images';

import styles from './landing-page.module.css';

const trustItems = [
  {
    icon: 'account_tree',
    title: 'Programmes',
    description: 'Structured paths to ownership designed for clarity.',
  },
  {
    icon: 'travel_explore',
    title: 'Discovery',
    description: 'Access vetted and verified property listings across Ghana.',
  },
  {
    icon: 'monitoring',
    title: 'Tracking',
    description: 'Monitor your progress from enquiry to acquisition.',
  },
  {
    icon: 'support_agent',
    title: 'Support',
    description: 'Dedicated AGAs to guide your specific journey.',
  },
] as const;

const steps = [
  {
    title: 'Create your account',
    description: 'Set up your secure profile and verify your identity to begin.',
  },
  {
    title: 'Choose programme or property',
    description: 'Select a structured ownership programme or browse live listings.',
  },
  {
    title: 'Join/create group or send enquiry',
    description: 'Connect with others for collective ownership or enquire directly.',
  },
  {
    title: 'Track progress',
    description: 'Watch your acquisition journey unfold through our milestone tracker.',
  },
] as const;

type LandingPageProps = {
  programmes: ProgrammeItem[];
  featuredProperties: PropertyItem[];
};

export function LandingPage({ programmes, featuredProperties }: LandingPageProps) {
  const [heroReady, setHeroReady] = useState(false);
  const [showListings, setShowListings] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setHeroReady(true), 500);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.brand}>GroupTown</div>
          <nav className={styles.nav}>
            <Link className={styles.activeLink} href={routes.home}>
              Home
            </Link>
              <Link href={routes.shop}>S.H.O.P.</Link>
              <Link href={routes.slop}>S.L.O.P.</Link>
              <Link href={routes.properties}>Properties</Link>
              <Link href={routes.about}>About</Link>
              <Link href={routes.help}>Help</Link>
              <Link href={routes.agent}>Become an AGA</Link>
            </nav>
          <AuthActions />
        </div>
      </header>

      <main>
        <section className={styles.heroSection}>
          {!heroReady && (
            <div className={styles.heroLoader}>
              <div className={styles.spinner} />
            </div>
          )}
          <div className={styles.heroOverlay} />
          <div
            className={`${styles.heroBackground} ${heroReady ? styles.heroVisible : ''}`}
            style={{
              backgroundImage: `url('${sharedImages.hero}')`,
            }}
          />
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div className={styles.heroContent}>
              <span className={styles.heroBadge}>
                Ownership and property opportunities, organised clearly
              </span>
              <h1>
                Plan your path to a home, land or property opportunity with GroupTown
              </h1>
              <p>
                Explore Sedan ownership programmes, discover approved property listings, and
                track your journey through one secure platform.
              </p>
              <div className={styles.heroActions}>
                <Link className={styles.lightButton} href={routes.programmes}>
                  Explore Programmes
                </Link>
                <Link className={styles.outlineLightButton} href={routes.properties}>
                  Browse Properties
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.surfaceSection}>
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <h2>Organised Growth and Shared Progress</h2>
              <p>
                GroupTown brings programmes, property discovery, progress tracking and support
                into one professional ecosystem.
              </p>
            </div>
            <div className={styles.trustGrid}>
              {trustItems.map((item) => (
                <article key={item.title} className={styles.trustCard}>
                  <div className={styles.iconBubble}>
                    <span className="material-symbols-outlined">{item.icon}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.mutedSection}>
          <div className={styles.container}>
            <div className={styles.sectionRow}>
              <h2>Ownership Pathways</h2>
              <Link className={styles.inlineLink} href={routes.programmes}>
                View All <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>
            <div className={styles.pathwayGrid}>
              {programmes.map((pathway) => (
                <article key={pathway.slug} className={styles.pathwayCard}>
                  <span
                    className={`${styles.pathwayTag} ${
                      pathway.theme === 'dark'
                        ? styles.tagDark
                        : pathway.theme === 'muted'
                          ? styles.tagMuted
                          : styles.tagLight
                    }`}>
                    {pathway.label}
                  </span>
                  <h3>{pathway.title}</h3>
                  <p>{pathway.summary}</p>
                  <Link className={styles.linkButton} href={pathway.href}>
                    Learn more <span className="material-symbols-outlined">chevron_right</span>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section} id="how-it-works">
          <div className={`${styles.container} ${styles.worksGrid}`}>
            <div>
              <h2 className={styles.leftAlignedHeading}>How GroupTown Works</h2>
              <div className={styles.steps}>
                {steps.map((step, index) => (
                  <div key={step.title} className={styles.stepRow}>
                    <div className={index === 0 ? styles.stepActive : styles.stepIdle}>
                      {index + 1}
                    </div>
                    <div>
                      <h4>{step.title}</h4>
                      <p>{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.squareImageFrame}>
              <img
                alt="GroupTown progress dashboard preview"
                className={styles.coverImage}
                src={sharedImages.apartment}
              />
            </div>
          </div>
        </section>

        <section className={styles.mutedSection}>
          <div className={styles.container}>
            <div className={styles.sectionControls}>
              <div>
                <h2 className={styles.leftAlignedHeading}>Featured Opportunities</h2>
                <p className={styles.sectionText}>
                  Verified listings in prime locations across Ghana.
                </p>
              </div>
              <div className={styles.toggleButtons}>
                <button
                  className={showListings ? styles.primaryPill : styles.secondaryPill}
                  onClick={() => setShowListings(true)}
                  type="button">
                  Live Listings
                </button>
                <button
                  className={!showListings ? styles.primaryPill : styles.secondaryPill}
                  onClick={() => setShowListings(false)}
                  type="button">
                  Pending Updates
                </button>
              </div>
            </div>

            {showListings ? (
              <div className={styles.propertyGrid}>
                {featuredProperties.map((property) => (
                  <article key={property.slug} className={styles.propertyCard}>
                    <div className={styles.propertyImageWrap}>
                      <img alt={property.title} className={styles.coverImage} src={property.image} />
                      <span className={styles.propertyType}>{property.type}</span>
                    </div>
                    <div className={styles.propertyBody}>
                      <h4>{property.title}</h4>
                      <p className={styles.locationRow}>
                        <span className="material-symbols-outlined">location_on</span>
                        {property.location}
                      </p>
                      <div className={styles.propertyFooter}>
                        <span>{property.price}</span>
                        <Link className={styles.detailButton} href={property.href}>
                          View Detail
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <span className="material-symbols-outlined">search_off</span>
                </div>
                <h3>No new properties found</h3>
                <p>
                  We are currently vetting new listings in this region. Please check back later or
                  register to receive notifications for new opportunities.
                </p>
                <Link className={styles.outlineButton} href={routes.notify}>
                  Notify Me
                </Link>
              </div>
            )}
          </div>
        </section>

        <section className={styles.darkSection}>
          <div className={`${styles.container} ${styles.agentGrid}`}>
            <div className={styles.agentImageWrap}>
              <img
                alt="Accredited GroupTown Agent"
                className={styles.coverImage}
                src={sharedImages.townhouse}
              />
            </div>
            <div className={styles.agentCopy}>
              <h2>Become an Accredited GroupTown Agent (AGA)</h2>
              <p>
                Join our network of elite agents. Every AGA undergoes a rigorous review process
                and is assigned specific territories to ensure expert local knowledge and absolute
                transparency for our users.
              </p>
              <ul className={styles.bulletList}>
                <li>
                  <span className="material-symbols-outlined">verified</span>
                  Exclusive territory management
                </li>
                <li>
                  <span className="material-symbols-outlined">verified</span>
                  Access to verified Sedan leads
                </li>
                <li>
                  <span className="material-symbols-outlined">verified</span>
                  Professional certification and training
                </li>
              </ul>
              <Link className={styles.lightButton} href={routes.agent}>
                Learn about becoming an AGA
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.supportStrip}>
          <div className={`${styles.container} ${styles.supportContent}`}>
            <div className={styles.supportLinks}>
              <Link href={routes.help}>
                <span className="material-symbols-outlined">help_outline</span>
                Help Centre
              </Link>
              <Link href={routes.contact}>
                <span className="material-symbols-outlined">mail</span>
                Contact Support
              </Link>
              <Link href={routes.compliance}>
                <span className="material-symbols-outlined">gavel</span>
                Compliance
              </Link>
            </div>
            <div className={styles.partnerText}>Partnered with trusted Ghanaian banks</div>
          </div>
        </section>

        <section className={styles.finalCta}>
          <div className={styles.narrowContainer}>
            <h2>Ready to begin your GroupTown journey?</h2>
            <div className={styles.heroActions}>
              <Link className={styles.primaryButton} href={routes.register}>
                Register
              </Link>
              <Link className={styles.outlineButton} href={routes.programmes}>
                Explore Programmes
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={`${styles.container} ${styles.footerGrid}`}>
          <div>
            <div className={styles.footerBrand}>GroupTown</div>
            <p>Revolutionising property ownership through collective intelligence.</p>
          </div>
          <div>
            <h5>Programmes</h5>
            <Link href={routes.shop}>S.H.O.P.</Link>
            <Link href={routes.slop}>S.L.O.P.</Link>
          </div>
          <div>
            <h5>Properties</h5>
            <Link href={routes.properties}>Listings</Link>
            <Link href={routes.properties}>Verified opportunities</Link>
          </div>
          <div>
            <h5>Company</h5>
            <Link href={routes.about}>About Us</Link>
            <Link href={routes.help}>Help Centre</Link>
          </div>
          <div>
            <h5>Legal</h5>
            <Link href={routes.terms}>Terms</Link>
            <Link href={routes.privacy}>Privacy</Link>
          </div>
        </div>
        <div className={`${styles.container} ${styles.footerBottom}`}>
          <p>© 2024 GroupTown. All rights reserved. Collective Ownership Platform.</p>
        </div>
      </footer>
    </div>
  );
}
