import Link from 'next/link';

import type { PropertyDetailData } from '@/lib/firebase/properties-data';
import { routes } from '@/lib/routes';

import styles from './property-detail-page.module.css';

type PropertyDetailPageProps = {
  property: PropertyDetailData;
};

export function PropertyDetailPage({ property }: PropertyDetailPageProps) {
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
            <Link className={styles.activeLink} href={routes.properties}>
              Properties
            </Link>
            <Link href={routes.howItWorks}>How It Works</Link>
            <Link href={routes.agent}>Become an AGA</Link>
          </nav>
          <div className={styles.headerActions}>
            <Link className={styles.signInLink} href={routes.login}>
              Sign In
            </Link>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.heroSection}>
          <div className={`${styles.container} ${styles.breadcrumbs}`}>
            <Link href={routes.home}>Home</Link>
            <span className="material-symbols-outlined">chevron_right</span>
            <Link href={routes.properties}>Properties</Link>
            <span className="material-symbols-outlined">chevron_right</span>
            <span>{property.title}</span>
          </div>

          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div className={styles.galleryWrap}>
              <img alt={property.title} className={styles.heroImage} src={property.image} />
              <div className={styles.imageBadgeRow}>
                <span
                  className={
                    property.transactionType === 'Sale' ? styles.saleBadge : styles.rentalBadge
                  }>
                  {property.transactionType.toUpperCase()}
                </span>
                <span className={styles.statusBadge}>{property.statusLabel}</span>
              </div>
            </div>

            <div className={styles.summaryPanel}>
              <p className={styles.locationRow}>
                <span className="material-symbols-outlined">location_on</span>
                {property.location}
              </p>
              <h1>{property.title}</h1>
              <div className={styles.priceRow}>{property.priceLabel}</div>
              <p className={styles.summary}>{property.summary}</p>

              <div className={styles.metricRow}>
                <div>
                  <span className="material-symbols-outlined">bed</span>
                  <strong>{property.bedrooms}</strong>
                  <span>Bedrooms</span>
                </div>
                <div>
                  <span className="material-symbols-outlined">bathtub</span>
                  <strong>{property.bathrooms}</strong>
                  <span>Bathrooms</span>
                </div>
                <div>
                  <span className="material-symbols-outlined">home</span>
                  <strong>{property.propertyType}</strong>
                  <span>Type</span>
                </div>
              </div>

              <div className={styles.actionRow}>
                <Link className={styles.primaryButton} href={routes.contact}>
                  Enquire Now
                </Link>
                <Link className={styles.secondaryButton} href={routes.register}>
                  Save Listing
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className={`${styles.container} ${styles.detailSection}`}>
          <div className={styles.detailGrid}>
            <div className={styles.contentCard}>
              <h2>Property overview</h2>
              <p>
                This property is listed within the GroupTown search experience and surfaced through
                the same review-led structure used across programmes, opportunities, and verified
                property workflows.
              </p>
              <ul className={styles.featureList}>
                {property.features.map((feature) => (
                  <li key={feature}>
                    <span className="material-symbols-outlined">check_circle</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <aside className={styles.sideCard}>
              <h3>Listing confidence</h3>
              <div className={styles.verificationItem}>
                <span className={styles.verifiedDot} />
                <span>{property.verificationLabel}</span>
              </div>
              <p>
                GroupTown can present listing-level verification states, document review progress,
                and guided support flows before a user commits to a deeper transaction step.
              </p>
              <Link className={styles.inlineLink} href={routes.contact}>
                Ask about this listing
              </Link>
            </aside>
          </div>
        </section>

        <section className={`${styles.container} ${styles.relatedSection}`}>
          <div className={styles.sectionHeader}>
            <h2>Related properties</h2>
            <Link className={styles.inlineLink} href={routes.properties}>
              Back to all properties
            </Link>
          </div>
          <div className={styles.relatedGrid}>
            {property.relatedListings.map((item) => (
              <article key={item.slug} className={styles.relatedCard}>
                <img alt={item.title} className={styles.relatedImage} src={item.image} />
                <div className={styles.relatedBody}>
                  <h3>{item.title}</h3>
                  <p>{item.location}</p>
                  <div className={styles.relatedFooter}>
                    <span>{item.priceLabel}</span>
                    <Link href={item.href}>View Details</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
