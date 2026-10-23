import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';

import { routes } from '@/lib/routes';

import { getDb } from './client';
import { hasFirebaseConfig } from './config';

export type ShopAudienceItem = {
  icon: string;
  title: string;
  description: string;
};

export type ShopJourneyStep = {
  label: string;
  description: string;
};

export type ShopCapabilityItem = {
  icon: string;
  label: string;
};

export type ShopDocumentItem = {
  label: string;
  statusIcon: string;
};

export type ShopFaqItem = {
  question: string;
  answer: string;
};

export type ShopPageData = {
  heroTitle: string;
  heroDescription: string;
  overviewTitle: string;
  overviewDescription: string;
  overviewBullets: string[];
  overviewImage: string;
  audienceItems: ShopAudienceItem[];
  journeySteps: ShopJourneyStep[];
  capabilities: ShopCapabilityItem[];
  memberCount: number;
  documentsNotice: string;
  documentItems: ShopDocumentItem[];
  faqs: ShopFaqItem[];
  finalCtaTitle: string;
  finalCtaDescription: string;
  brochureHref: string;
};

const fallbackShopData: ShopPageData = {
  heroTitle: 'Sedan Home Ownership Programme (S.H.O.P.)',
  heroDescription:
    'A structured pathway to collective home ownership in Ghana. Join forces with vetted partners to secure land and develop high-quality homes with institutional oversight.',
  overviewTitle: 'What S.H.O.P. is',
  overviewDescription:
    'The Sedan Home Ownership Programme (S.H.O.P.) is an innovative collective ownership framework designed for the Ghanaian market. It allows individuals to pool resources under a secure, legally-binding structure managed by GroupTown.',
  overviewBullets: [
    'Legally verified land acquisition processes.',
    'Transparent milestone-based contribution plans.',
    'Professional project management and delivery.',
  ],
  overviewImage:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuB8MwXy2gv82BV2W7Hf2q7hWmaif3bP3AJ4ttcj4JK5UKZNWv_Gpnww6CAy7TGrPjGosNZ5TkWBd7DM8BQtDhPli3jKtvhE_T9vJFv_XEwA-mszmZGo5-8Z-h46MzfvkxDfcQOFOlAP2G5g1ts2JCqW87VYK6zTBpG9DVRUv9M0TncCRbuxEAYUFz91NWOLpMnkFlGswItG8mc-nfgLTEXM6xjbPTFGiCova83wrnG9rER67bNRvGnNYbfgPHv-Sw13EL-jPR3Knfw',
  audienceItems: [
    {
      icon: 'person',
      title: 'First-Time Buyers',
      description:
        'Individuals looking to enter the property market without the daunting burden of full independent development costs.',
    },
    {
      icon: 'group',
      title: 'Families',
      description:
        'Groups or extended families wanting to secure adjacent properties or a shared estate through a structured legal framework.',
    },
    {
      icon: 'event_repeat',
      title: 'Long-Term Planners',
      description:
        'Professional planners who prefer a multi-year, managed pathway to ownership rather than high-interest short-term loans.',
    },
  ],
  journeySteps: [
    { label: 'Account Setup', description: 'Create and verify your user profile.' },
    {
      label: 'Expression of Interest',
      description: 'Submit your preferred location and type.',
    },
    { label: 'Group Formation', description: 'Join or create an approved group.' },
    { label: 'Contribution Plan', description: 'Follow the agreed payment schedule.' },
    { label: 'Track Progress', description: 'Live updates on site development.' },
  ],
  capabilities: [
    { icon: 'assignment', label: 'Application Status' },
    { icon: 'groups', label: 'Group Activity' },
    { icon: 'payments', label: 'Contribution Records' },
    { icon: 'receipt_long', label: 'Digital Receipts' },
    { icon: 'notifications', label: 'Notifications' },
  ],
  memberCount: 12,
  documentsNotice:
    'Final group, allocation, payment, default and ownership terms are subject to approved programme, Finance and Legal documentation.',
  documentItems: [
    { label: 'Valid National ID (Ghana Card/Passport)', statusIcon: 'check_box_outline_blank' },
    { label: 'Proof of Residency/Employment', statusIcon: 'check_box_outline_blank' },
    { label: 'Vetted Bank Statement (6 Months)', statusIcon: 'check_box_outline_blank' },
    { label: 'Character Reference Letter', statusIcon: 'check_box_outline_blank' },
    { label: 'Signed Group Conduct Agreement', statusIcon: 'check_box_outline_blank' },
  ],
  faqs: [
    {
      question: 'How are the property groups formed?',
      answer:
        'Groups are formed based on mutual interest in specific locations and property types. GroupTown facilitates the vetting and matching process to ensure compatibility and collective financial stability.',
    },
    {
      question: 'What happens if a group member defaults on a payment?',
      answer:
        'Our legal framework includes predefined mitigation strategies, such as secondary reserve funds and buyout options, to protect the progress of the remaining group members.',
    },
    {
      question: 'Is this a mortgage or a lease-to-own scheme?',
      answer:
        'Neither. S.H.O.P. is a collective equity-building programme. It is designed to minimize high-interest bank debt by utilizing group pooling and institutional project management.',
    },
  ],
  finalCtaTitle: 'Ready to secure your future?',
  finalCtaDescription:
    'Join the next generation of property owners in Ghana. Start your application for the Sedan Home Ownership Programme today.',
  brochureHref: routes.contact,
};

function toStringArray(value: unknown, fallback: string[]) {
  return Array.isArray(value) ? value.map((item) => String(item)) : fallback;
}

async function loadShopProgrammeDocument() {
  const db = getDb();
  if (!db) {
    return fallbackShopData;
  }

  const programmeQuery = query(
    collection(db, 'programmes'),
    where('slug', '==', 'shop'),
    where('isPublished', '==', true),
    limit(1)
  );
  const snapshot = await getDocs(programmeQuery);

  if (snapshot.empty) {
    return fallbackShopData;
  }

  const data = snapshot.docs[0].data();
  const audienceItems = Array.isArray(data.audienceItems)
    ? data.audienceItems.map((item) => ({
        icon: String(item.icon ?? 'person'),
        title: String(item.title ?? 'Audience'),
        description: String(item.description ?? ''),
      }))
    : fallbackShopData.audienceItems;
  const journeySteps = Array.isArray(data.journeyStepsDetailed)
    ? data.journeyStepsDetailed.map((item) => ({
        label: String(item.label ?? 'Step'),
        description: String(item.description ?? ''),
      }))
    : fallbackShopData.journeySteps;
  const capabilities = Array.isArray(data.dashboardCapabilities)
    ? data.dashboardCapabilities.map((item) => ({
        icon: String(item.icon ?? 'dashboard'),
        label: String(item.label ?? 'Capability'),
      }))
    : fallbackShopData.capabilities;
  const documentItems = Array.isArray(data.documentItems)
    ? data.documentItems.map((item) => ({
        label: String(item.label ?? 'Required document'),
        statusIcon: String(item.statusIcon ?? 'check_box_outline_blank'),
      }))
    : fallbackShopData.documentItems;

  return {
    heroTitle: String(data.heroTitle ?? fallbackShopData.heroTitle),
    heroDescription: String(data.heroDescription ?? fallbackShopData.heroDescription),
    overviewTitle: String(data.overviewTitle ?? fallbackShopData.overviewTitle),
    overviewDescription: String(data.overviewDescription ?? fallbackShopData.overviewDescription),
    overviewBullets: toStringArray(data.overviewBullets, fallbackShopData.overviewBullets),
    overviewImage: String(data.overviewImage ?? fallbackShopData.overviewImage),
    audienceItems,
    journeySteps,
    capabilities,
    memberCount: Number(data.memberCount ?? fallbackShopData.memberCount),
    documentsNotice: String(data.documentsNotice ?? fallbackShopData.documentsNotice),
    documentItems,
    faqs: fallbackShopData.faqs,
    finalCtaTitle: String(data.finalCtaTitle ?? fallbackShopData.finalCtaTitle),
    finalCtaDescription: String(data.finalCtaDescription ?? fallbackShopData.finalCtaDescription),
    brochureHref: String(data.brochureHref ?? fallbackShopData.brochureHref),
  } satisfies ShopPageData;
}

async function loadShopFaqs() {
  const db = getDb();
  if (!db) {
    return fallbackShopData.faqs;
  }

  const faqQuery = query(
    collection(db, 'faqs'),
    where('isPublished', '==', true),
    where('category', '==', 'shop'),
    orderBy('sortOrder', 'asc'),
    limit(8)
  );
  const snapshot = await getDocs(faqQuery);

  if (snapshot.empty) {
    return fallbackShopData.faqs;
  }

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      question: String(data.question ?? 'Untitled question'),
      answer: String(data.answer ?? ''),
    } satisfies ShopFaqItem;
  });
}

export async function getShopPageData(): Promise<ShopPageData> {
  if (!hasFirebaseConfig()) {
    return fallbackShopData;
  }

  try {
    const [programmeData, faqs] = await Promise.all([loadShopProgrammeDocument(), loadShopFaqs()]);
    return { ...programmeData, faqs };
  } catch {
    return fallbackShopData;
  }
}
