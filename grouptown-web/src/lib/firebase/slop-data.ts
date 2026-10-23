import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';

import { routes } from '@/lib/routes';

import { getDb } from './client';
import { hasFirebaseConfig } from './config';

export type SlopAudienceItem = {
  icon: string;
  title: string;
  description: string;
};

export type SlopJourneyStep = {
  label: string;
  description: string;
};

export type SlopOpportunityItem = {
  title: string;
  subtitle: string;
  type: string;
  status: string;
  image: string;
  href: string;
};

export type SlopCapabilityItem = {
  icon: string;
  title: string;
  description: string;
};

export type SlopEligibilityItem = {
  label: string;
};

export type SlopFaqItem = {
  question: string;
  answer: string;
};

export type SlopPageData = {
  heroTitle: string;
  heroDescription: string;
  heroImage: string;
  overviewTitle: string;
  overviewParagraphs: string[];
  complianceTitle: string;
  complianceDescription: string;
  audienceItems: SlopAudienceItem[];
  journeySteps: SlopJourneyStep[];
  opportunitiesTitle: string;
  opportunities: SlopOpportunityItem[];
  capabilitiesTitle: string;
  capabilitiesDescription: string;
  capabilities: SlopCapabilityItem[];
  eligibilityItems: SlopEligibilityItem[];
  noticeTitle: string;
  noticeDescription: string;
  noticeFootnote: string;
  faqs: SlopFaqItem[];
  finalCtaTitle: string;
  finalCtaDescription: string;
};

const fallbackSlopData: SlopPageData = {
  heroTitle: 'Sedan Landbank Ownership Programme (S.L.O.P.)',
  heroDescription:
    'A structured framework for collective land acquisition and title security in Ghana. Providing the legal architecture for groups to secure institutional-grade property assets.',
  heroImage:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDZLxz0oHUHtZLSQOLrRzJQKtVHM72z5bOlXwafAGq1WHYOymcMywsat2KIPbSFIcPJD3XoJyhkq7p-alm81vUUQIMybrcq8V_F1PX8ghVeOoB2TldVpWt7u9c-c_Z1GapdvcDd7IgWCuPgqRvGm7GF0wCe2Sk3AtURK_nw1sgMGRbBpahSj-j69cPDeF9HYJl99OLk-WL6JAO7cFkmX8ZcgzLizOfw6XN7yyc4s3XrU7Ds1ySmSsD2yI_K9yT3BMkGOFchTjLKZqM',
  overviewTitle: 'The Architecture of Security',
  overviewParagraphs: [
    'The Sedan Landbank Ownership Programme (S.L.O.P.) is an institutional response to the complexities of land acquisition in Ghana. It operates as a collective ownership framework, where participants pool resources to acquire significant land interests that would otherwise be inaccessible to individual retail buyers.',
    'Through S.L.O.P., GroupTown manages the entire lifecycle of landbanking from comprehensive due diligence and title verification to the administration of collective holding entities. This ensures that every interest is backed by a robust legal structure, minimizing individual risk and maximizing the integrity of the land title.',
  ],
  complianceTitle: 'Legal Compliance & Governance',
  complianceDescription:
    'All landbank acquisitions are processed via Special Purpose Vehicles (SPVs) specifically structured to protect collective interests under Ghanaian property law.',
  audienceItems: [
    {
      icon: 'update',
      title: 'Long-term Planners',
      description:
        'Individuals looking to secure land for future utility without the immediate burden of development costs.',
    },
    {
      icon: 'groups',
      title: 'Group Investors',
      description:
        'Organized families, cooperatives, or professional circles seeking to acquire large contiguous parcels together.',
    },
    {
      icon: 'architecture',
      title: 'Future Homebuilders',
      description:
        'Those planning to build a residence in 5-10 years and wishing to secure the land at current market entry points.',
    },
  ],
  journeySteps: [
    { label: 'Create Account', description: 'Initialize your verified profile.' },
    { label: 'Express Interest', description: 'Select your preferred land zone.' },
    { label: 'Provide Info', description: 'Submit KYC and legal details.' },
    { label: 'Join Group', description: 'Align with a collective SPV.' },
    { label: 'Monitor', description: 'Track title and allocation status.' },
  ],
  opportunitiesTitle: 'Current Landbank Reserves',
  opportunities: [
    {
      title: 'Cantonments Extension',
      subtitle: 'Phase A - Sector 12',
      type: 'Collective',
      status: 'Pending Review',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBnIeSqtMrGBjv7mzJREVeTcN8Xu_beBJ5NYhSK0s7ZpNjp4vJJzSDJGyacyMBVrtCEUa5YhcJnGLjVbqtdRWA7GfOm5P_Ahaz80iOJ0FUGtAeD6rDNLFASnnANw4VUA06lE0b_JLTlM2GJ7l5ZA5qBTSHBlpNrygkHOcb97_x0RYDAS7dpNbk1kchHNDmMAdiVjGdZQBVj48chkiW6Lol74RZhjbdR1mBSYS45IK02O_qNbjKpeMYGA7Uxd2M-SugE7w_fl71iWek',
      href: routes.properties,
    },
    {
      title: 'Prampram Coastal',
      subtitle: 'Zone B - Reserve Area',
      type: 'Landbank',
      status: 'Placeholder Data',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAg-qPfwEQGY4xiGs_Ifl2rfoVB_R9LDdQfE1JPRPxYdf_7FOyeqXT9pq5O3JT8gUY2tQoa1GJStAafzgXFHqmQKBEF1CgqZBMQGIokAmrZT5eW7xmtOKwCpn_geqyFOrycYH-yzPLsDsPBzBTXMdfRkoz20b_18F1O7kuPtDmbzBKlFwIj9eCZdKjU3i41mp_Wh7TLX2OqtfFoM-eNZWh-gUYqKJVJPwpyXhQLI7iEzqZ-a_CVmEh5e8oeNYwEKXoB71uH4qnWn-o',
      href: routes.properties,
    },
    {
      title: 'Aburi Heights',
      subtitle: 'Greenfield Project 1',
      type: 'Collective',
      status: 'Pending Review',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCnRuAFWhHoHZznFIHpoOiJBe2UGwX5RLJMK6oh3UhlIo2sfzCXYFhrlW6eUSUZSiATrHxMSJNrrQYhpgFOd9-K5MtwPhaJVCCcEJnTV1dIwiM233PTS7t644s2E_0noGlluloWiYfnZM7RDSF4Rmp2_Z7C2g5-5hM5lV_XLZpr9DW9cV0-aJhYk0YBFPKRlkJWk3PYMeYD6mhu7sWJrG-0xkQQf8YucHB-w-I10duXMl1N08QXV59txTEmTT1StgjFWIgpZussl68',
      href: routes.properties,
    },
  ],
  capabilitiesTitle: 'Owner Dashboard Capabilities',
  capabilitiesDescription:
    'Track your legal, administrative, and collective ownership progress from one place.',
  capabilities: [
    { icon: 'assignment', title: 'Application', description: 'Real-time status of your entry into the programme.' },
    { icon: 'hub', title: 'Group Status', description: 'Monitoring the collective progress of your ownership group.' },
    { icon: 'account_balance_wallet', title: 'Contribution Records', description: 'Transparent ledger of all financial commitments.' },
    { icon: 'description', title: 'Documents', description: 'Secure vault for land titles, indentures, and receipts.' },
    { icon: 'notifications_active', title: 'Notices', description: 'Direct communications regarding property updates.' },
    { icon: 'support_agent', title: 'Support', description: 'Direct channel for legal and administrative inquiries.' },
  ],
  eligibilityItems: [
    { label: 'Valid National ID (Passport or Ghana Card)' },
    { label: 'Proof of Address (Utility bill or digital address)' },
    { label: 'Completion of Risk Awareness Disclosure' },
    { label: 'Verified financial capacity for contributions' },
  ],
  noticeTitle: 'Due Diligence Notice',
  noticeDescription:
    'Final property, title, allocation and payment terms depend on approved documentation and review. GroupTown guarantees the rigorous execution of legal procedures but participants must review all specific project terms before commitment.',
  noticeFootnote:
    'The S.L.O.P. framework is designed for secure administrative property holding and is not presented as an investment product with projected returns.',
  faqs: [
    {
      question: 'How is my individual portion of the land title secured?',
      answer:
        'Ownership is typically secured via a legally binding indenture tied to the Special Purpose Vehicle (SPV) that holds the master title. Each member receives a certificate of beneficial interest that specifies their exact plot allocation within the larger reserve.',
    },
    {
      question: 'Can I build on my plot immediately?',
      answer:
        'The S.L.O.P. is primarily a landbanking programme for long-term security. While development is possible, it is typically scheduled after the collective infrastructure phase is completed for the entire block to maintain property standards and value.',
    },
    {
      question: 'What happens if a group member stops contributing?',
      answer:
        'Our legal framework includes clear exit and default clauses. If a member is unable to fulfill their obligations, their interest may be liquidated or transferred according to the pre-agreed group charter.',
    },
  ],
  finalCtaTitle: 'Ready to secure your land interest?',
  finalCtaDescription:
    'Join the next cohort of future landowners. Start your application today and move towards collective property security.',
};

function toStringArray(value: unknown, fallback: string[]) {
  return Array.isArray(value) ? value.map((item) => String(item)) : fallback;
}

async function loadSlopProgrammeDocument() {
  const db = getDb();
  if (!db) {
    return fallbackSlopData;
  }

  const programmeQuery = query(
    collection(db, 'programmes'),
    where('slug', '==', 'slop'),
    where('isPublished', '==', true),
    limit(1)
  );
  const snapshot = await getDocs(programmeQuery);

  if (snapshot.empty) {
    return fallbackSlopData;
  }

  const data = snapshot.docs[0].data();

  const audienceItems = Array.isArray(data.audienceItems)
    ? data.audienceItems.map((item) => ({
        icon: String(item.icon ?? 'groups'),
        title: String(item.title ?? 'Audience'),
        description: String(item.description ?? ''),
      }))
    : fallbackSlopData.audienceItems;

  const journeySteps = Array.isArray(data.journeyStepsDetailed)
    ? data.journeyStepsDetailed.map((item) => ({
        label: String(item.label ?? 'Step'),
        description: String(item.description ?? ''),
      }))
    : fallbackSlopData.journeySteps;

  const opportunities = Array.isArray(data.opportunities)
    ? data.opportunities.map((item) => ({
        title: String(item.title ?? 'Untitled opportunity'),
        subtitle: String(item.subtitle ?? ''),
        type: String(item.type ?? 'Collective'),
        status: String(item.status ?? 'Pending Review'),
        image: String(item.image ?? fallbackSlopData.opportunities[0].image),
        href: String(item.href ?? routes.properties),
      }))
    : fallbackSlopData.opportunities;

  const capabilities = Array.isArray(data.dashboardCapabilities)
    ? data.dashboardCapabilities.map((item) => ({
        icon: String(item.icon ?? 'dashboard'),
        title: String(item.title ?? 'Capability'),
        description: String(item.description ?? ''),
      }))
    : fallbackSlopData.capabilities;

  const eligibilityItems = Array.isArray(data.eligibilityItems)
    ? data.eligibilityItems.map((item) => ({
        label: String(item.label ?? item),
      }))
    : fallbackSlopData.eligibilityItems;

  return {
    heroTitle: String(data.heroTitle ?? fallbackSlopData.heroTitle),
    heroDescription: String(data.heroDescription ?? fallbackSlopData.heroDescription),
    heroImage: String(data.heroImage ?? fallbackSlopData.heroImage),
    overviewTitle: String(data.overviewTitle ?? fallbackSlopData.overviewTitle),
    overviewParagraphs: toStringArray(data.overviewParagraphs, fallbackSlopData.overviewParagraphs),
    complianceTitle: String(data.complianceTitle ?? fallbackSlopData.complianceTitle),
    complianceDescription: String(data.complianceDescription ?? fallbackSlopData.complianceDescription),
    audienceItems,
    journeySteps,
    opportunitiesTitle: String(data.opportunitiesTitle ?? fallbackSlopData.opportunitiesTitle),
    opportunities,
    capabilitiesTitle: String(data.capabilitiesTitle ?? fallbackSlopData.capabilitiesTitle),
    capabilitiesDescription: String(
      data.capabilitiesDescription ?? fallbackSlopData.capabilitiesDescription
    ),
    capabilities,
    eligibilityItems,
    noticeTitle: String(data.noticeTitle ?? fallbackSlopData.noticeTitle),
    noticeDescription: String(data.noticeDescription ?? fallbackSlopData.noticeDescription),
    noticeFootnote: String(data.noticeFootnote ?? fallbackSlopData.noticeFootnote),
    faqs: fallbackSlopData.faqs,
    finalCtaTitle: String(data.finalCtaTitle ?? fallbackSlopData.finalCtaTitle),
    finalCtaDescription: String(
      data.finalCtaDescription ?? fallbackSlopData.finalCtaDescription
    ),
  } satisfies SlopPageData;
}

async function loadSlopFaqs() {
  const db = getDb();
  if (!db) {
    return fallbackSlopData.faqs;
  }

  const faqQuery = query(
    collection(db, 'faqs'),
    where('isPublished', '==', true),
    where('category', '==', 'slop'),
    orderBy('sortOrder', 'asc'),
    limit(8)
  );
  const snapshot = await getDocs(faqQuery);

  if (snapshot.empty) {
    return fallbackSlopData.faqs;
  }

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      question: String(data.question ?? 'Untitled question'),
      answer: String(data.answer ?? ''),
    } satisfies SlopFaqItem;
  });
}

export async function getSlopPageData(): Promise<SlopPageData> {
  if (!hasFirebaseConfig()) {
    return fallbackSlopData;
  }

  try {
    const [programmeData, faqs] = await Promise.all([loadSlopProgrammeDocument(), loadSlopFaqs()]);
    return { ...programmeData, faqs };
  } catch {
    return fallbackSlopData;
  }
}
