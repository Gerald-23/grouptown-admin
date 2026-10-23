import { collection, getDocs, limit, query, where } from 'firebase/firestore';

import { getDb } from './client';
import { hasFirebaseConfig } from './config';

export type AboutEcosystemItem = {
  icon: string;
  title: string;
  description: string;
};

export type AboutStep = {
  number: string;
  title: string;
  description: string;
};

export type AboutPillar = {
  title: string;
  description: string;
};

export type AboutPathway = {
  title: string;
  description: string;
  href: string;
};

export type AboutPageData = {
  heroTitle: string;
  heroImage: string;
  missionLabel: string;
  missionText: string;
  ecosystemTitle: string;
  ecosystemItems: AboutEcosystemItem[];
  operatingTitle: string;
  operatingSteps: AboutStep[];
  partnershipLabel: string;
  partnershipTitle: string;
  partnershipParagraphs: string[];
  partnershipImage: string;
  pillarsTitle: string;
  pillars: AboutPillar[];
  pathwaysTitle: string;
  pathways: AboutPathway[];
  finalCtaTitle: string;
  finalCtaDescription: string;
};

const fallbackData: AboutPageData = {
  heroTitle: 'A clearer way to navigate group ownership and property opportunities',
  heroImage:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBql91lTN2oONusnIC2BiJoPwZiOe0ct3UhnF1yZfZzdnXT3BMWfyN8QkZ717rwWcN4041i5gM2Kn9QwoNAh5XmpWTUTE3jJAJOf1MsSGSA47qJegyAAYfQextM_huvpWM3N7ytDSmCTuV-rqCMzQlxJdR44W9IUud1iK9DuCKYsmWVhcOMj74x7ZyID571ZOy3KaInHGaIJZT-qvsmIVgqZr-fSWpFNwLb2LSNDnEH6goZsjQdR2XQ7CXmjtXlLb7hn0qKMp3JBok',
  missionLabel: 'Our Mission',
  missionText:
    'GroupTown exists to provide a structured, transparent, and legally-backed framework for collective property ownership in Ghana. By merging innovative group mechanics with institutional oversight, we ensure that every participant\'s investment is protected and their pathway to ownership is clearly defined.',
  ecosystemTitle: 'The GroupTown Ecosystem',
  ecosystemItems: [
    {
      icon: 'groups',
      title: 'People',
      description:
        'Collective power through verified groups. We facilitate the union of individuals with shared financial goals.',
    },
    {
      icon: 'account_balance',
      title: 'Sedan Programmes',
      description:
        'Structured ownership frameworks providing the legal and financial scaffolding for group success.',
    },
    {
      icon: 'domain',
      title: 'Properties',
      description:
        'Approved listings only. Every rental or sale property undergoes rigorous verification before display.',
    },
    {
      icon: 'verified_user',
      title: 'Accredited Agents',
      description:
        'Professional oversight provided by vetted Ghanaian agents to ensure transactional integrity.',
    },
  ],
  operatingTitle: 'How GroupTown Operates',
  operatingSteps: [
    {
      number: '01',
      title: 'Discovery & Grouping',
      description:
        'Users explore verified property opportunities and join groups of like-minded individuals to pool resources effectively.',
    },
    {
      number: '02',
      title: 'Institutional Onboarding',
      description:
        'Groups are onboarded into structured Sedan programmes, ensuring legal compliance and financial transparency from day one.',
    },
    {
      number: '03',
      title: 'Managed Execution',
      description:
        'Transactions are completed with accredited agents overseeing the process, culminating in secure, shared asset ownership.',
    },
  ],
  partnershipLabel: 'Strategic Partnership',
  partnershipTitle: 'The Sedan Landbank Link',
  partnershipParagraphs: [
    'GroupTown operates as the primary digital interface for the Sedan Landbank, providing users with exclusive access to premium real estate opportunities that were previously inaccessible.',
    'This vertical integration ensures that our property listings are not just verified, but backed by the institutional strength and legacy of Sedan\'s extensive property portfolio in Ghana.',
  ],
  partnershipImage:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAVenp6akby8bYakfk0lOUMb3v08Rjbulmk1bthqgZPVjXTVHTEKwtHwKoMRV4XQV6e07LyOcYHJzQv-7kQSSWVoCC0ToB1sbBRkluO-hztVQC2KZlOf8HhRrYjDEZpu4SQXqC7x-g0geEuhRSNi9mSN0uu8BZnpI8Dkq8puyBfE3Li9XTxHrRc0uI3t6L5ipBcR1pmuiMmieimVF5F-dil_-FIKokZ3ZSA3D-Rxou3vcGlXbOFUrogIihlaPRnhUbn1PWA9ZlRg8E',
  pillarsTitle: 'Core Pillars',
  pillars: [
    {
      title: 'Clarity',
      description:
        'Removing the ambiguity from property documentation and group financial structures.',
    },
    {
      title: 'Access',
      description:
        'Democratizing high-value real estate through strategic collective purchasing power.',
    },
    {
      title: 'Accountability',
      description:
        'Maintaining rigorous standards for agents, developers, and ownership group management.',
    },
    {
      title: 'Support',
      description:
        'Providing professional guidance at every stage of the property acquisition journey.',
    },
  ],
  pathwaysTitle: 'Explore Your Path',
  pathways: [
    {
      title: 'S.H.O.P.',
      description: 'Shared Home Ownership Programme for residential dreams.',
      href: '/programmes/shop',
    },
    {
      title: 'S.L.O.P.',
      description: 'Shared Land Ownership Programme for future developments.',
      href: '/programmes/slop',
    },
    {
      title: 'Rental',
      description: 'Browse verified rental listings across prime locations.',
      href: '/properties',
    },
    {
      title: 'Sale',
      description: 'Explore premium properties available for full individual purchase.',
      href: '/properties',
    },
  ],
  finalCtaTitle: 'Need expert assistance?',
  finalCtaDescription:
    'Our specialized support team is ready to guide you through the complexities of property ownership.',
};

export async function getAboutPageData(): Promise<AboutPageData> {
  if (!hasFirebaseConfig()) {
    return fallbackData;
  }

  try {
    const db = getDb();
    if (!db) {
      return fallbackData;
    }

    const pageQuery = query(
      collection(db, 'pages'),
      where('slug', '==', 'about'),
      where('isPublished', '==', true),
      limit(1)
    );

    const snapshot = await getDocs(pageQuery);
    if (snapshot.empty) {
      return fallbackData;
    }

    const data = snapshot.docs[0].data();

    return {
      heroTitle: String(data.heroTitle ?? fallbackData.heroTitle),
      heroImage: String(data.heroImage ?? fallbackData.heroImage),
      missionLabel: String(data.missionLabel ?? fallbackData.missionLabel),
      missionText: String(data.missionText ?? fallbackData.missionText),
      ecosystemTitle: String(data.ecosystemTitle ?? fallbackData.ecosystemTitle),
      ecosystemItems: Array.isArray(data.ecosystemItems)
        ? data.ecosystemItems.map((item) => ({
            icon: String(item.icon ?? 'groups'),
            title: String(item.title ?? 'Item'),
            description: String(item.description ?? ''),
          }))
        : fallbackData.ecosystemItems,
      operatingTitle: String(data.operatingTitle ?? fallbackData.operatingTitle),
      operatingSteps: Array.isArray(data.operatingSteps)
        ? data.operatingSteps.map((item, index) => ({
            number: String(item.number ?? `${index + 1}`.padStart(2, '0')),
            title: String(item.title ?? 'Step'),
            description: String(item.description ?? ''),
          }))
        : fallbackData.operatingSteps,
      partnershipLabel: String(data.partnershipLabel ?? fallbackData.partnershipLabel),
      partnershipTitle: String(data.partnershipTitle ?? fallbackData.partnershipTitle),
      partnershipParagraphs: Array.isArray(data.partnershipParagraphs)
        ? data.partnershipParagraphs.map((item) => String(item))
        : fallbackData.partnershipParagraphs,
      partnershipImage: String(data.partnershipImage ?? fallbackData.partnershipImage),
      pillarsTitle: String(data.pillarsTitle ?? fallbackData.pillarsTitle),
      pillars: Array.isArray(data.pillars)
        ? data.pillars.map((item) => ({
            title: String(item.title ?? 'Pillar'),
            description: String(item.description ?? ''),
          }))
        : fallbackData.pillars,
      pathwaysTitle: String(data.pathwaysTitle ?? fallbackData.pathwaysTitle),
      pathways: Array.isArray(data.pathways)
        ? data.pathways.map((item) => ({
            title: String(item.title ?? 'Path'),
            description: String(item.description ?? ''),
            href: String(item.href ?? '/'),
          }))
        : fallbackData.pathways,
      finalCtaTitle: String(data.finalCtaTitle ?? fallbackData.finalCtaTitle),
      finalCtaDescription: String(data.finalCtaDescription ?? fallbackData.finalCtaDescription),
    };
  } catch {
    return fallbackData;
  }
}
