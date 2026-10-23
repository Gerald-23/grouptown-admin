import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';

import { getPropertiesPageData } from './properties-data';
import { getDb } from './client';
import { hasFirebaseConfig } from './config';
import { sharedImages } from '@/lib/shared-images';

export type ProgrammeItem = {
  slug: string;
  title: string;
  summary: string;
  label: string;
  href: string;
  theme: 'dark' | 'muted' | 'light';
};

export type PropertyItem = {
  slug: string;
  type: string;
  title: string;
  location: string;
  price: string;
  image: string;
  href: string;
};

type LandingData = {
  programmes: ProgrammeItem[];
  featuredProperties: PropertyItem[];
};

const fallbackData: LandingData = {
  programmes: [
    {
      slug: 'shop',
      label: 'S.H.O.P.',
      title: 'Home Ownership',
      summary: 'Sedan Home Ownership Programme for structured family dwellings.',
      href: '/programmes/shop',
      theme: 'dark',
    },
    {
      slug: 'slop',
      label: 'S.L.O.P.',
      title: 'Landbank',
      summary: 'Sedan Landbank Ownership Programme for future developments.',
      href: '/programmes/slop',
      theme: 'muted',
    },
    {
      slug: 'rentals',
      label: 'Rental',
      title: 'House Rental',
      summary: 'Verified residential rentals with transparent terms.',
      href: '/properties',
      theme: 'light',
    },
    {
      slug: 'sales',
      label: 'Sale',
      title: 'House Sale',
      summary: 'Direct and secure property acquisitions for ready buyers.',
      href: '/properties',
      theme: 'light',
    },
  ],
  featuredProperties: [
    {
      slug: 'executive-3-bedroom-apartment',
      type: 'Rental',
      title: 'Executive 3-Bedroom Apartment',
      location: 'East Legon, Accra',
      price: 'GHS 15,000 / month',
      image: sharedImages.apartment,
      href: '/properties/executive-3-bedroom-apartment',
    },
    {
      slug: 'modern-5-bedroom-villa',
      type: 'Sale',
      title: 'Modern 5-Bedroom Villa',
      location: 'Cantonments, Accra',
      price: 'GHS 1,200,000',
      image: sharedImages.villa,
      href: '/properties/modern-5-bedroom-villa',
    },
    {
      slug: 'kumasi-heights-townhouse',
      type: 'Sale',
      title: 'Kumasi Heights Townhouse',
      location: 'Ahodwo, Kumasi',
      price: 'GHS 950,000',
      image: sharedImages.townhouse,
      href: '/properties/kumasi-heights-townhouse',
    },
  ],
};

async function loadProgrammes() {
  const db = getDb();
  if (!db) {
    return fallbackData.programmes;
  }

  const programmesQuery = query(
    collection(db, 'programmes'),
    where('isPublished', '==', true),
    orderBy('sortOrder', 'asc'),
    limit(4)
  );
  const snapshot = await getDocs(programmesQuery);

  if (snapshot.empty) {
    return fallbackData.programmes;
  }

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      slug: String(data.slug ?? doc.id),
      label: String(data.label ?? 'Programme'),
      title: String(data.title ?? 'Untitled programme'),
      summary: String(data.summary ?? ''),
      href: String(data.href ?? `/programmes/${String(data.slug ?? doc.id)}`),
      theme:
        data.theme === 'dark' || data.theme === 'muted' || data.theme === 'light'
          ? data.theme
          : 'light',
    } satisfies ProgrammeItem;
  });
}

async function loadFeaturedProperties() {
  const propertiesData = await getPropertiesPageData();
  const featuredListings = propertiesData.listings
    .slice()
    .sort((left, right) => {
      const leftRank = left.isFeatured ? (left.featuredRank ?? Number.MAX_SAFE_INTEGER) : Number.MAX_SAFE_INTEGER;
      const rightRank = right.isFeatured ? (right.featuredRank ?? Number.MAX_SAFE_INTEGER) : Number.MAX_SAFE_INTEGER;

      if (leftRank !== rightRank) {
        return leftRank - rightRank;
      }

      if (left.isFeatured !== right.isFeatured) {
        return left.isFeatured ? -1 : 1;
      }

      return 0;
    })
    .slice(0, 3);

  if (!featuredListings.length) {
    return fallbackData.featuredProperties;
  }

  return featuredListings.map((item) => ({
    slug: item.slug,
    type: item.transactionType,
    title: item.title,
    location: item.location,
    price: item.priceLabel,
    image: item.image,
    href: item.href,
  }));
}

export async function getLandingData(): Promise<LandingData> {
  if (!hasFirebaseConfig()) {
    return fallbackData;
  }

  try {
    const [programmes, featuredProperties] = await Promise.all([
      loadProgrammes(),
      loadFeaturedProperties(),
    ]);

    return { programmes, featuredProperties };
  } catch {
    return fallbackData;
  }
}
