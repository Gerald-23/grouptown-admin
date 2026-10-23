'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { AuthActions } from '@/components/auth-actions';
import type { PropertiesPageData } from '@/lib/firebase/properties-data';
import { routes } from '@/lib/routes';

import styles from './properties-page.module.css';

type PropertiesPageProps = {
  data: PropertiesPageData;
};

export function PropertiesPage({ data }: PropertiesPageProps) {
  const [query, setQuery] = useState('');
  const [transactionType, setTransactionType] = useState<'All' | 'Rental' | 'Sale'>('All');
  const [region, setRegion] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [bedrooms, setBedrooms] = useState<number | null>(null);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'priceLow' | 'priceHigh'>('newest');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sheetView, setSheetView] = useState<'filter' | 'sort' | null>(null);

  function toggleType(type: string) {
    setSelectedTypes((current) =>
      current.includes(type) ? current.filter((item) => item !== type) : [...current, type]
    );
  }

  function resetFilters() {
    setQuery('');
    setTransactionType('All');
    setRegion('');
    setSelectedTypes([]);
    setMinPrice('');
    setMaxPrice('');
    setBedrooms(null);
    setVerifiedOnly(false);
    setSortBy('newest');
  }

  const filteredListings = useMemo(() => {
    const min = Number(minPrice.replace(/,/g, '')) || 0;
    const max = Number(maxPrice.replace(/,/g, '')) || Number.POSITIVE_INFINITY;

    const matches = data.listings.filter((item) => {
      const matchesQuery =
        !query ||
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.location.toLowerCase().includes(query.toLowerCase());
      const matchesTransaction =
        transactionType === 'All' || item.transactionType === transactionType;
      const matchesRegion = !region || item.cityRegion === region;
      const matchesType = !selectedTypes.length || selectedTypes.includes(item.propertyType);
      const matchesBedrooms = bedrooms === null || item.bedrooms >= bedrooms;
      const matchesVerified = !verifiedOnly || item.verified;
      const matchesPrice = item.priceValue >= min && item.priceValue <= max;

      return (
        matchesQuery &&
        matchesTransaction &&
        matchesRegion &&
        matchesType &&
        matchesBedrooms &&
        matchesVerified &&
        matchesPrice
      );
    });

    return matches.sort((left, right) => {
      if (sortBy === 'priceLow') {
        return left.priceValue - right.priceValue;
      }

      if (sortBy === 'priceHigh') {
        return right.priceValue - left.priceValue;
      }

      return 0;
    });
  }, [
    bedrooms,
    data.listings,
    maxPrice,
    minPrice,
    query,
    region,
    selectedTypes,
    sortBy,
    transactionType,
    verifiedOnly,
  ]);

  const chipItems = [
    ...(transactionType !== 'All' ? [transactionType] : []),
    ...(region ? [region] : []),
    ...selectedTypes,
    ...(bedrooms !== null ? [`${bedrooms}+ Bedrooms`] : []),
    ...(verifiedOnly ? ['Verified Only'] : []),
  ];

  function formatInputValue(value: string) {
    const digits = value.replace(/[^0-9]/g, '');
    return digits ? new Intl.NumberFormat('en-GH').format(Number(digits)) : '';
  }

  return (
    <div className={styles.page}>
      <div
        className={`${styles.mobileDrawer} ${drawerOpen ? styles.overlayOpen : ''}`}
        onClick={() => setDrawerOpen(false)}>
        <div className={styles.mobileDrawerBackdrop} />
        <aside className={styles.mobileDrawerPanel} onClick={(event) => event.stopPropagation()}>
          <div className={styles.mobileDrawerBrandRow}>
            <div className={styles.mobileDrawerBrandIcon}>
              <span className="material-symbols-outlined">domain</span>
            </div>
            <div>
              <h2>GroupTown</h2>
              <p>Collective Ownership</p>
            </div>
          </div>

          <nav className={styles.mobileDrawerNav}>
            <Link href={routes.home}>Home</Link>
            <Link className={styles.mobileDrawerActive} href={routes.properties}>
              Properties
            </Link>
            <Link href={routes.programmes}>Programmes</Link>
            <Link href={routes.howItWorks}>How It Works</Link>
            <Link href={routes.agent}>Become an AGA</Link>
            <Link href={routes.about}>About</Link>
            <Link href={routes.help}>Help</Link>
          </nav>

          <div className={styles.mobileDrawerFooter}>
            <AuthActions compact />
          </div>
        </aside>
      </div>

      <div
        className={`${styles.bottomSheet} ${sheetView ? styles.overlayOpen : ''}`}
        onClick={() => setSheetView(null)}>
        <div className={styles.bottomSheetBackdrop} />
        <div className={styles.bottomSheetPanel} onClick={(event) => event.stopPropagation()}>
          <div className={styles.bottomSheetHandle} />

          {sheetView === 'filter' ? (
            <div className={styles.bottomSheetContent}>
              <h4>Filter Properties</h4>

              <div className={styles.bottomSheetField}>
                <label>CITY / REGION</label>
                <select onChange={(event) => setRegion(event.target.value)} value={region}>
                  <option value="">All regions</option>
                  {data.regionOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.bottomSheetField}>
                <label>PROPERTY TYPE</label>
                <div className={styles.mobileTypeGrid}>
                  {data.propertyTypeOptions.map((item) => (
                    <button
                      key={item}
                      className={
                        selectedTypes.includes(item) ? styles.mobileTypeActive : styles.mobileTypeIdle
                      }
                      onClick={() => toggleType(item)}
                      type="button">
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.bottomSheetField}>
                <label>PRICE RANGE (GHS)</label>
                <div className={styles.priceRange}>
                  <input
                    onChange={(event) => setMinPrice(formatInputValue(event.target.value))}
                    placeholder="Min"
                    type="text"
                    value={minPrice}
                  />
                  <input
                    onChange={(event) => setMaxPrice(formatInputValue(event.target.value))}
                    placeholder="Max"
                    type="text"
                    value={maxPrice}
                  />
                </div>
              </div>

              <div className={styles.bottomSheetField}>
                <label>BEDROOMS</label>
                <div className={styles.bedroomGrid}>
                  {[1, 2, 3, 4].map((count) => (
                    <button
                      key={count}
                      className={bedrooms === count ? styles.bedroomActive : styles.bedroomIdle}
                      onClick={() => setBedrooms(count)}
                      type="button">
                      {`${count}+`}
                    </button>
                  ))}
                </div>
              </div>

              <label className={styles.checkboxRow}>
                <input
                  checked={verifiedOnly}
                  onChange={() => setVerifiedOnly((current) => !current)}
                  type="checkbox"
                />
                <span>Verified Listings Only</span>
              </label>

              <div className={styles.bottomSheetActions}>
                <button className={styles.clearButton} onClick={resetFilters} type="button">
                  Clear All Filters
                </button>
                <button
                  className={styles.bottomSheetPrimary}
                  onClick={() => setSheetView(null)}
                  type="button">
                  Apply Filters
                </button>
              </div>
            </div>
          ) : null}

          {sheetView === 'sort' ? (
            <div className={styles.bottomSheetContent}>
              <h4>Sort By</h4>
              <div className={styles.sortOptionList}>
                {[
                  ['newest', 'Newest First'],
                  ['priceLow', 'Price: Low to High'],
                  ['priceHigh', 'Price: High to Low'],
                ].map(([value, label]) => (
                  <label key={value} className={styles.sortOption}>
                    <span>{label}</span>
                    <input
                      checked={sortBy === value}
                      name="mobile-sort"
                      onChange={() =>
                        setSortBy(value as 'newest' | 'priceLow' | 'priceHigh')
                      }
                      type="radio"
                    />
                  </label>
                ))}
              </div>
              <button
                className={styles.bottomSheetPrimary}
                onClick={() => setSheetView(null)}
                type="button">
                Confirm
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <header className={styles.header}>
        <div className={styles.mobileHeader}>
          <div className={styles.mobileTopBar}>
            <button
              className={styles.mobileIconButton}
              onClick={() => setDrawerOpen(true)}
              type="button">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <Link className={styles.mobileBrand} href={routes.home}>
              GroupTown
            </Link>
            <Link className={styles.mobileIconButton} href={routes.login}>
              <span className="material-symbols-outlined">person</span>
            </Link>
          </div>

          <div className={styles.mobileSearchSection}>
            <div className={styles.mobileSearchField}>
              <span className="material-symbols-outlined">search</span>
              <input
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search areas, developments..."
                type="text"
                value={query}
              />
            </div>

            <div className={styles.mobileSegmentedControl}>
              <button
                className={
                  transactionType === 'Rental' ? styles.mobileSegmentActive : styles.mobileSegmentIdle
                }
                onClick={() => setTransactionType('Rental')}
                type="button">
                Rental
              </button>
              <button
                className={
                  transactionType === 'Sale' ? styles.mobileSegmentActive : styles.mobileSegmentIdle
                }
                onClick={() => setTransactionType('Sale')}
                type="button">
                Sale
              </button>
            </div>
          </div>

          <div className={styles.mobileActionBar}>
            <button
              className={styles.mobileActionButton}
              onClick={() => setSheetView('filter')}
              type="button">
              <span className="material-symbols-outlined">filter_list</span>
              <span>Filter</span>
            </button>
            <button
              className={styles.mobileActionButton}
              onClick={() => setSheetView('sort')}
              type="button">
              <span className="material-symbols-outlined">swap_vert</span>
              <span>Sort</span>
            </button>
          </div>

          {chipItems.length > 0 ? (
            <div className={styles.mobileChipRow}>
              {chipItems.map((item) => (
                <div key={item} className={styles.mobileChip}>
                  <span>{item}</span>
                  <span className="material-symbols-outlined">close</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>

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
          <AuthActions compact />
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.heroSection}>
          <div className={styles.container}>
            <h1>Find a home to rent or buy</h1>
            <div className={styles.searchPanel}>
              <div className={styles.searchField}>
                <label>Location or Keyword</label>
                <div className={styles.inputWrap}>
                  <span className="material-symbols-outlined">search</span>
                  <input
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="e.g. East Legon, Cantonments..."
                    type="text"
                    value={query}
                  />
                </div>
              </div>
              <div className={styles.transactionField}>
                <label>Transaction Type</label>
                <div className={styles.segmentedControl}>
                  <button
                    className={transactionType === 'All' ? styles.segmentActive : styles.segmentIdle}
                    onClick={() => setTransactionType('All')}
                    type="button">
                    All
                  </button>
                  <button
                    className={
                      transactionType === 'Rental' ? styles.segmentActive : styles.segmentIdle
                    }
                    onClick={() => setTransactionType('Rental')}
                    type="button">
                    Rental
                  </button>
                  <button
                    className={transactionType === 'Sale' ? styles.segmentActive : styles.segmentIdle}
                    onClick={() => setTransactionType('Sale')}
                    type="button">
                    Sale
                  </button>
                </div>
              </div>
              <button className={styles.primarySearchButton} type="button">
                Search Properties
              </button>
            </div>
          </div>
        </section>

        <section className={`${styles.container} ${styles.resultsLayout}`}>
          <aside className={styles.sidebar}>
            <div className={styles.sidebarSticky}>
              <h2>Filters</h2>
              <div className={styles.filterGroup}>
                <label>CITY / REGION</label>
                <select onChange={(event) => setRegion(event.target.value)} value={region}>
                  <option value="">All regions</option>
                  {data.regionOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label>PROPERTY TYPE</label>
                <div className={styles.checkboxList}>
                  {data.propertyTypeOptions.map((item) => (
                    <label key={item} className={styles.checkboxRow}>
                      <input
                        checked={selectedTypes.includes(item)}
                        onChange={() => toggleType(item)}
                        type="checkbox"
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className={styles.filterGroup}>
                <label>PRICE RANGE (GHS)</label>
                <div className={styles.priceRange}>
                  <input
                    onChange={(event) => setMinPrice(formatInputValue(event.target.value))}
                    placeholder="Min"
                    type="text"
                    value={minPrice}
                  />
                  <input
                    onChange={(event) => setMaxPrice(formatInputValue(event.target.value))}
                    placeholder="Max"
                    type="text"
                    value={maxPrice}
                  />
                </div>
              </div>

              <div className={styles.filterGroup}>
                <label>BEDROOMS</label>
                <div className={styles.bedroomGrid}>
                  {[1, 2, 3, 4].map((count) => (
                    <button
                      key={count}
                      className={bedrooms === count ? styles.bedroomActive : styles.bedroomIdle}
                      onClick={() => setBedrooms(count)}
                      type="button">
                      {`${count}+`}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.filterGroup}>
                <label>LISTING STATUS</label>
                <label className={styles.checkboxRow}>
                  <input
                    checked={verifiedOnly}
                    onChange={() => setVerifiedOnly((current) => !current)}
                    type="checkbox"
                  />
                  <span>Verified Listings Only</span>
                </label>
              </div>

              <button className={styles.clearButton} onClick={resetFilters} type="button">
                Clear All Filters
              </button>
            </div>
          </aside>

          <div className={styles.resultsMain}>
            <div className={styles.resultsHeader}>
              <span>{`${filteredListings.length} properties found`}</span>
              <div className={styles.sortRow}>
                <span>SORT BY</span>
                <select
                  onChange={(event) =>
                    setSortBy(event.target.value as 'newest' | 'priceLow' | 'priceHigh')
                  }
                  value={sortBy}>
                  <option value="newest">Newest First</option>
                  <option value="priceLow">Price: Low to High</option>
                  <option value="priceHigh">Price: High to Low</option>
                </select>
              </div>
            </div>

            {chipItems.length > 0 ? (
              <div className={styles.chipRow}>
                {chipItems.map((item) => (
                  <div key={item} className={styles.filterChip}>
                    <span>{item}</span>
                    <span className="material-symbols-outlined">close</span>
                  </div>
                ))}
              </div>
            ) : null}

            <div className={styles.propertyGrid}>
              {filteredListings.map((item) => (
                <article key={item.slug} className={styles.propertyCard}>
                  <div className={styles.propertyImageWrap}>
                    <img alt={item.title} className={styles.coverImage} src={item.image} />
                    <div
                      className={
                        item.transactionType === 'Sale' ? styles.saleBadge : styles.rentalBadge
                      }>
                      {item.transactionType.toUpperCase()}
                    </div>
                    <button className={styles.saveButton} type="button">
                      <span className="material-symbols-outlined">favorite</span>
                      <div className={styles.saveTooltip}>Login required to save</div>
                    </button>
                  </div>

                  <div className={styles.propertyBody}>
                    <div className={styles.propertyHeaderRow}>
                      <h3>{item.title}</h3>
                      <div className={styles.priceStack}>
                        <p>{item.transactionType === 'Sale' ? 'Full Price' : 'Starting at'}</p>
                        <strong>{item.priceLabel}</strong>
                      </div>
                    </div>
                    <p className={styles.locationRow}>
                      <span className="material-symbols-outlined">location_on</span>
                      {item.location}
                    </p>
                    <div className={styles.featureRow}>
                      <div>
                        <span className="material-symbols-outlined">bed</span>
                        <span>{`${item.bedrooms} Beds`}</span>
                      </div>
                      <div>
                        <span className="material-symbols-outlined">bathtub</span>
                        <span>{`${item.bathrooms} Baths`}</span>
                      </div>
                      {item.squareFeet ? (
                        <div>
                          <span className="material-symbols-outlined">square_foot</span>
                          <span>{`${item.squareFeet.toLocaleString()} sqft`}</span>
                        </div>
                      ) : null}
                    </div>
                    <div className={styles.propertyFooter}>
                      <div className={styles.verificationBadge}>
                        <span className="material-symbols-outlined">
                          {item.verified ? 'verified' : 'pending'}
                        </span>
                        <span>{item.verificationLabel}</span>
                      </div>
                      <Link className={styles.detailLink} href={item.href}>
                        Details
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className={styles.pagination}>
              <button className={styles.pageArrow} type="button">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <div className={styles.pageNumbers}>
                <button className={styles.pageActive} type="button">
                  1
                </button>
                <button className={styles.pageIdle} type="button">
                  2
                </button>
                <button className={styles.pageIdle} type="button">
                  3
                </button>
                <span className={styles.pageDots}>...</span>
                <button className={styles.pageIdle} type="button">
                  12
                </button>
              </div>
              <button className={styles.pageArrow} type="button">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={`${styles.container} ${styles.footerGrid}`}>
          <div>
            <div className={styles.footerBrand}>GroupTown</div>
            <p>
              Institutional Property Management for Ghana. Modernizing land and home ownership
              through collective stability.
            </p>
          </div>
          <div>
            <h4>Company</h4>
            <Link href={routes.about}>About Us</Link>
            <Link href={routes.legal}>Legal</Link>
            <Link href={routes.privacy}>Privacy Policy</Link>
          </div>
          <div>
            <h4>Support</h4>
            <Link href={routes.contact}>Contact Us</Link>
            <Link href={routes.faq}>FAQ</Link>
            <Link href={routes.terms}>Terms of Service</Link>
          </div>
          <div>
            <h4>Connect</h4>
            <div className={styles.connectIcons}>
              <span className="material-symbols-outlined">qr_code_2</span>
              <span className="material-symbols-outlined">link</span>
              <span className="material-symbols-outlined">alternate_email</span>
            </div>
          </div>
        </div>
        <div className={`${styles.container} ${styles.footerBottom}`}>
          <span>© 2024 GroupTown. Institutional Property Management for Ghana.</span>
          <div>
            <span>Ghana Property Board Certified</span>
          </div>
        </div>
      </footer>

      <nav className={styles.mobileBottomNav}>
        <Link className={styles.mobileBottomItem} href={routes.home}>
          <span className="material-symbols-outlined">home</span>
          <span>Home</span>
        </Link>
        <Link
          className={`${styles.mobileBottomItem} ${styles.mobileBottomActive}`}
          href={routes.properties}>
          <span className="material-symbols-outlined">domain</span>
          <span>Search</span>
        </Link>
        <button className={styles.mobileBottomItem} type="button">
          <span className="material-symbols-outlined">favorite</span>
          <span>Saved</span>
        </button>
        <button className={styles.mobileBottomItem} type="button">
          <span className="material-symbols-outlined">notifications</span>
          <span>Alerts</span>
        </button>
      </nav>
    </div>
  );
}
