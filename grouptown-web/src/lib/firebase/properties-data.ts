import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';

import { routes } from '@/lib/routes';

import { getDb } from './client';
import { hasFirebaseConfig } from './config';

export type PropertyListing = {
  slug: string;
  title: string;
  location: string;
  cityRegion: string;
  transactionType: 'Rental' | 'Sale';
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet?: number;
  verified: boolean;
  verificationLabel: string;
  priceValue: number;
  priceLabel: string;
  image: string;
  href: string;
  isFeatured?: boolean;
  featuredRank?: number;
};

export type PropertiesPageData = {
  totalFoundLabel: string;
  regionOptions: string[];
  propertyTypeOptions: string[];
  listings: PropertyListing[];
};

export type PropertyDetailData = PropertyListing & {
  summary: string;
  statusLabel: string;
  features: string[];
  relatedListings: PropertyListing[];
};

const fallbackListings: PropertyListing[] = [
  {
    slug: 'executive-3-bedroom-apartment',
    title: 'Executive 3-Bedroom Apartment',
    location: 'East Legon, Accra',
    cityRegion: 'Greater Accra',
    transactionType: 'Rental',
    propertyType: 'Apartment',
    bedrooms: 3,
    bathrooms: 2,
    squareFeet: 1240,
    verified: true,
    verificationLabel: 'Document Review: Passed',
    priceValue: 15000,
    priceLabel: 'GHS 15,000 / month',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCZSPUaOasT0KwgREkynIzSXYYIuU-_M4IIZoqIsnM7vIqwfBqK9WSHmOReJUfblLpi5m61m8HrCLyCQBk5znUPeLmPOjGXBKpBpDFDZ1tNY4Bc6ViQ6pj4mAnfV2EHaByUw40KHZrSJTz8zkswcMjHanfH-IKs_GEVZ7BDYo5ebuLutf7gmPmuI7HFpYQpQTuQSIREiIAcDszHa5SQIYm9hmykhEOpqg0dpey1GrgonA89ikfJ0l4RAn0lvWF5oWMdNBpjPfHgaSk',
    href: '/properties/executive-3-bedroom-apartment',
  },
  {
    slug: 'modern-5-bedroom-villa',
    title: 'Modern 5-Bedroom Villa',
    location: 'Cantonments, Accra',
    cityRegion: 'Greater Accra',
    transactionType: 'Sale',
    propertyType: 'Villa',
    bedrooms: 5,
    bathrooms: 4,
    squareFeet: 2100,
    verified: true,
    verificationLabel: 'Document Review: Passed',
    priceValue: 1200000,
    priceLabel: 'GHS 1,200,000',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAihwYb5F9TXXpdr-ZbguN_zbFdv8v2aTPfzry82JU8OWmHcPVilOwMcdxlJepcRzXk20OjEEPL8fTivWguObLZFHEyk7NHOY5B1k7gRlM_Sy2Khclt8_Qr3jQUcZrybqIq75V4BjsfCJnQjQypi2a0O6fNu8vm0XBAj3X639wFTQy7NExEvhZSY7MJ43FAgEmrAq1Mk8vkwUvWBHY8VJp8NPhDMhjo9k0EcwLYQFbwUISrV_Apu7x40y-sn1advEkxc_VHnF6n1PE',
    href: '/properties/modern-5-bedroom-villa',
  },
  {
    slug: 'urban-studio-duplex',
    title: 'Urban Studio Duplex',
    location: 'Airport Residential, Accra',
    cityRegion: 'Greater Accra',
    transactionType: 'Rental',
    propertyType: 'Apartment',
    bedrooms: 1,
    bathrooms: 1,
    squareFeet: 980,
    verified: true,
    verificationLabel: 'Document Review: Passed',
    priceValue: 8500,
    priceLabel: 'GHS 8,500 / month',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAhs7wYWtZFR8-hE9PlbNRRqP0opXnNIaWmlrwoJvrHZIIDouA-m8p0qAIqlO7J1yeHXEGG_93FDIiliW2g1R6kKZw8hwnKzpbatJpFEqJFDbSI9ac8AFiPxbEZYfEdw1QrHtvMffjYL898MSeucRHbaVazKlCv-B8YxAFfWT8EVnA0DsjYhqKaI1ZDnKHJ3paIaAZLXRtiQiVDPTfQjRn5H5YM8mFWE8zVCWH0y5xfuDdvSyzMV52aFvg5VrJucfnnQNY0_dOsScQ',
    href: '/properties/urban-studio-duplex',
  },
  {
    slug: 'kumasi-heights-townhouse',
    title: 'Kumasi Heights Townhouse',
    location: 'Ahodwo, Kumasi',
    cityRegion: 'Ashanti Region',
    transactionType: 'Sale',
    propertyType: 'Townhouse',
    bedrooms: 4,
    bathrooms: 3,
    squareFeet: 1860,
    verified: true,
    verificationLabel: 'Document Review: Passed',
    priceValue: 950000,
    priceLabel: 'GHS 950,000',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCyCAOzQfRECHUBO0eaKm8yDktYB701udIP7FA7df4fE7U0A-1YYfC6-Q92PfdOZanicj2oIojEVxM7DmEdbhOdF6RojAlRM8fo196VEaglgu_DwETWcHkrazrQs5n6iX_2Fhlj04VA8eqt3b-zFe2c3hkAWO-4_pMJ_D9nREizPcGkKySQPXblrLOn6Jvng4PJIZAVe3l_QVbko7dU0fwD0O7wAqFRREl_pLx1wrgn73qlRjpK3PiZGQF72_YqvBhmgP9HmOPJoLk',
    href: '/properties/kumasi-heights-townhouse',
  },
];

const fallbackData: PropertiesPageData = {
  totalFoundLabel: '48 properties found',
  regionOptions: ['Greater Accra', 'Ashanti Region', 'Western Region'],
  propertyTypeOptions: ['Apartment', 'Townhouse', 'Villa'],
  listings: fallbackListings,
};

async function loadProperties() {
  const db = getDb();
  if (!db) {
    return fallbackData;
  }

  const propertiesQuery = query(
    collection(db, 'properties'),
    where('isPublished', '==', true),
    orderBy('createdAt', 'desc'),
    limit(24)
  );
  const snapshot = await getDocs(propertiesQuery);

  if (snapshot.empty) {
    return fallbackData;
  }

  const listings = snapshot.docs.map((doc) => {
    const data = doc.data();
    const slug = String(data.slug ?? doc.id);
    const transactionType =
      String(data.transactionType ?? data.listingType ?? 'Rental').toLowerCase() === 'sale'
        ? 'Sale'
        : 'Rental';

    return {
      slug,
      title: String(data.title ?? 'Untitled property'),
      location: String(data.locationLabel ?? data.location ?? ''),
      cityRegion: String(data.cityRegion ?? data.region ?? 'Greater Accra'),
      transactionType,
      propertyType: String(data.propertyType ?? 'Apartment'),
      bedrooms: Number(data.bedrooms ?? 0),
      bathrooms: Number(data.bathrooms ?? 0),
      squareFeet: Number(data.squareFeet ?? data.sqft ?? 0) || undefined,
      verified: Boolean(data.isVerified ?? true),
      verificationLabel: String(data.verificationLabel ?? 'Document Review: Passed'),
      priceValue: Number(data.priceValue ?? data.price ?? 0),
      priceLabel: String(data.priceLabel ?? 'Price on request'),
      image: String(data.coverImage ?? data.image ?? fallbackListings[0].image),
      href: `${routes.properties}/${slug}`,
      isFeatured: Boolean(data.isFeatured ?? false),
      featuredRank: Number(data.featuredRank ?? Number.MAX_SAFE_INTEGER),
    } satisfies PropertyListing;
  });

  const regionOptions = Array.from(new Set(listings.map((item) => item.cityRegion))).filter(Boolean);
  const propertyTypeOptions = Array.from(
    new Set(listings.map((item) => item.propertyType))
  ).filter(Boolean);

  return {
    totalFoundLabel: `${listings.length} properties found`,
    regionOptions: regionOptions.length ? regionOptions : fallbackData.regionOptions,
    propertyTypeOptions: propertyTypeOptions.length
      ? propertyTypeOptions
      : fallbackData.propertyTypeOptions,
    listings,
  } satisfies PropertiesPageData;
}

export async function getPropertiesPageData(): Promise<PropertiesPageData> {
  if (!hasFirebaseConfig()) {
    return fallbackData;
  }

  try {
    return await loadProperties();
  } catch {
    return fallbackData;
  }
}

function buildFallbackDetail(slug: string): PropertyDetailData {
  const match =
    fallbackListings.find((item) => item.slug === slug) ??
    fallbackListings[0];

  return {
    ...match,
    summary:
      match.transactionType === 'Rental'
        ? 'A professionally reviewed rental opportunity presented through GroupTown with verified documentation status and structured search visibility.'
        : 'A professionally reviewed sale opportunity presented through GroupTown with verified documentation status and structured search visibility.',
    statusLabel: match.verified ? 'Document Review: Passed' : 'Pending Review',
    features: [
      `${match.bedrooms} bedroom layout`,
      `${match.bathrooms} bathroom arrangement`,
      `${match.propertyType} property type`,
      `${match.transactionType} transaction structure`,
    ],
    relatedListings: fallbackListings.filter((item) => item.slug !== match.slug).slice(0, 3),
  };
}

export async function getPropertyDetailData(slug: string): Promise<PropertyDetailData> {
  if (!hasFirebaseConfig()) {
    return buildFallbackDetail(slug);
  }

  try {
    const db = getDb();
    if (!db) {
      return buildFallbackDetail(slug);
    }

    const propertyQuery = query(
      collection(db, 'properties'),
      where('slug', '==', slug),
      where('isPublished', '==', true),
      limit(1)
    );
    const propertySnapshot = await getDocs(propertyQuery);

    if (propertySnapshot.empty) {
      return buildFallbackDetail(slug);
    }

    const data = propertySnapshot.docs[0].data();
    const transactionType =
      String(data.transactionType ?? data.listingType ?? 'Rental').toLowerCase() === 'sale'
        ? 'Sale'
        : 'Rental';

    const detail: PropertyDetailData = {
      slug,
      title: String(data.title ?? 'Untitled property'),
      location: String(data.locationLabel ?? data.location ?? ''),
      cityRegion: String(data.cityRegion ?? data.region ?? 'Greater Accra'),
      transactionType,
      propertyType: String(data.propertyType ?? 'Apartment'),
      bedrooms: Number(data.bedrooms ?? 0),
      bathrooms: Number(data.bathrooms ?? 0),
      squareFeet: Number(data.squareFeet ?? data.sqft ?? 0) || undefined,
      verified: Boolean(data.isVerified ?? true),
      verificationLabel: String(data.verificationLabel ?? 'Document Review: Passed'),
      priceValue: Number(data.priceValue ?? data.price ?? 0),
      priceLabel: String(data.priceLabel ?? 'Price on request'),
      image: String(data.coverImage ?? data.image ?? fallbackListings[0].image),
      href: String(data.href ?? `${routes.properties}/${slug}`),
      summary: String(
        data.summary ??
          data.description ??
          'This property is presented through GroupTown with listing-level verification and structured acquisition support.'
      ),
      statusLabel: String(data.statusLabel ?? (data.isVerified ? 'Document Review: Passed' : 'Pending Review')),
      features: Array.isArray(data.features)
        ? data.features.map((item) => String(item))
        : [
            `${Number(data.bedrooms ?? 0)} bedroom layout`,
            `${Number(data.bathrooms ?? 0)} bathroom arrangement`,
            String(data.propertyType ?? 'Apartment'),
            `${transactionType} opportunity`,
          ],
      relatedListings: [],
    };

    const allListings = await getPropertiesPageData();
    detail.relatedListings = allListings.listings.filter((item) => item.slug !== slug).slice(0, 3);

    return detail;
  } catch {
    return buildFallbackDetail(slug);
  }
}
