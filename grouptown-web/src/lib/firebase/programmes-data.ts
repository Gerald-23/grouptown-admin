import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';

import { routes } from '@/lib/routes';

import { getDb } from './client';
import { hasFirebaseConfig } from './config';

export type ProgrammeDirectoryCard = {
  slug: string;
  label: string;
  title: string;
  goal: string;
  suitability: string;
  image: string;
  href: string;
  cta: string;
  variant: 'solid' | 'outline';
  journeySteps: string[];
};

export type ProgrammeFaqItem = {
  question: string;
  answer: string;
};

export type ProgrammesPageData = {
  cards: ProgrammeDirectoryCard[];
  faqs: ProgrammeFaqItem[];
};

const fallbackProgrammeData: ProgrammesPageData = {
  cards: [
    {
      slug: 'shop',
      label: 'S.H.O.P.',
      title: 'Strategic Home Ownership Programme',
      goal: 'Secure full home ownership through collective acquisition and structured equity.',
      suitability:
        'Designed for families and individuals seeking a primary residence with long-term stability.',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDYwRmeJJZ0MMefcwLmPQ44jyZ3HxycJdReg7wnqOk24vCZtnxaZuu1nhmMfS2UEPOjr4sdonjyvA3SBi6CUuDLcaKdDEErcpIwq2Skc1ckEcdfSoSnNgNYU7TlHMEjyGX8INSdpOq36Q52i_pvAXn_9BxlOKcKFnRMMIHStFokx6oIhBkwQ4VdbLKzlevUomr45wFEyHiD_siVA5DuLlA1vzI5YsOX9nyCq85DO6VdwKSQObv-Gx6Dkck_lxJV1Ela1PSKv4HZkEQ',
      href: routes.shop,
      cta: 'Explore S.H.O.P.',
      variant: 'solid',
      journeySteps: ['Account', 'Selection', 'Group', 'Verification'],
    },
    {
      slug: 'slop',
      label: 'S.L.O.P.',
      title: 'Strategic Landbank Ownership Programme',
      goal: 'Participate in collective land acquisition for future development or capital preservation.',
      suitability:
        'Ideal for users looking to secure land assets in high-growth corridors before development begins.',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAL5ireeD0Zr23f8cmA4hGG5gtfxJTVpTm_c44Xq5wAe2pBDL6iMQl9ikbDR46ai7PJLZjOR5Rx5lHmpohfyTawgz2vCo6G6avW3xODNQFm2F1omoPiow83y9T77hn4XzBhVSwyUHyZbzfJ6xlCrEfGEYiHiuex0xQQBoPc1rXqwDopNNp9-EX7OjGentAIdkJB1vlFeIoBiksg85w2utzvqqeDitGOHqkSIkKnpCJE9c-NNd7R9w__GIDCSXr34FC257iRZvo5PJs',
      href: routes.slop,
      cta: 'Explore S.L.O.P.',
      variant: 'outline',
      journeySteps: ['Account', 'Selection', 'Group', 'Verification'],
    },
  ],
  faqs: [
    {
      question: 'Can I switch between S.H.O.P. and S.L.O.P. after registering?',
      answer:
        'Yes. The platform can allow a user to change programme intent before final verification, subject to the rules of the active opportunity and application stage.',
    },
    {
      question: "What happens if a group doesn't reach capacity?",
      answer:
        'Group formation logic can keep the opportunity pending, reroute members into the next matching cohort, or offer admin-assisted alternatives depending on the programme rules.',
    },
    {
      question: 'How are property titles managed in collective ownership?',
      answer:
        'Title structure depends on the final programme terms and legal vehicle used for that opportunity. The platform should expose this clearly before users commit to final acquisition steps.',
    },
  ],
};

async function loadProgrammeCards() {
  const db = getDb();
  if (!db) {
    return fallbackProgrammeData.cards;
  }

  const programmesQuery = query(
    collection(db, 'programmes'),
    where('isPublished', '==', true),
    where('showInDirectory', '==', true),
    orderBy('sortOrder', 'asc'),
    limit(6)
  );
  const snapshot = await getDocs(programmesQuery);

  if (snapshot.empty) {
    return fallbackProgrammeData.cards;
  }

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    const slug = String(data.slug ?? doc.id);
    const journeySteps = Array.isArray(data.journeySteps)
      ? data.journeySteps.map((step) => String(step))
      : ['Account', 'Selection', 'Group', 'Verification'];

    return {
      slug,
      label: String(data.label ?? 'Programme'),
      title: String(data.directoryTitle ?? data.title ?? 'Untitled programme'),
      goal: String(data.goal ?? data.summary ?? ''),
      suitability: String(data.suitability ?? ''),
      image: String(data.directoryImage ?? data.coverImage ?? fallbackProgrammeData.cards[0].image),
      href: String(data.href ?? `/programmes/${slug}`),
      cta: String(data.directoryCta ?? `Explore ${String(data.label ?? 'Programme')}`),
      variant: data.directoryVariant === 'outline' ? 'outline' : 'solid',
      journeySteps,
    } satisfies ProgrammeDirectoryCard;
  });
}

async function loadProgrammeFaqs() {
  const db = getDb();
  if (!db) {
    return fallbackProgrammeData.faqs;
  }

  const faqQuery = query(
    collection(db, 'faqs'),
    where('isPublished', '==', true),
    where('category', '==', 'programmes'),
    orderBy('sortOrder', 'asc'),
    limit(6)
  );
  const snapshot = await getDocs(faqQuery);

  if (snapshot.empty) {
    return fallbackProgrammeData.faqs;
  }

  return snapshot.docs.map((doc) => {
    const data = doc.data();

    return {
      question: String(data.question ?? 'Untitled question'),
      answer: String(data.answer ?? ''),
    } satisfies ProgrammeFaqItem;
  });
}

export async function getProgrammesPageData(): Promise<ProgrammesPageData> {
  if (!hasFirebaseConfig()) {
    return fallbackProgrammeData;
  }

  try {
    const [cards, faqs] = await Promise.all([loadProgrammeCards(), loadProgrammeFaqs()]);
    return { cards, faqs };
  } catch {
    return fallbackProgrammeData;
  }
}
