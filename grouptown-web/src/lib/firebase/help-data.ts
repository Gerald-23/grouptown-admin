import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';

import { getDb } from './client';
import { hasFirebaseConfig } from './config';

export type HelpCategory = {
  icon: string;
  title: string;
  description: string;
  href: string;
};

export type HelpFaq = {
  question: string;
  answer: string;
};

export type HelpLink = {
  title: string;
  href: string;
};

export type HelpPageData = {
  heroTitle: string;
  heroSubtitle: string;
  quickSearchPlaceholder: string;
  popularTopicsLabel: string;
  categories: HelpCategory[];
  faqTitle: string;
  faqs: HelpFaq[];
  relatedQuestions: HelpLink[];
  supportTitle: string;
  supportDescription: string;
  supportHours: string;
  supportImage: string;
  trustTitle: string;
  trustDescription: string;
  trustItems: string[];
};

const fallbackData: HelpPageData = {
  heroTitle: 'How can we help?',
  heroSubtitle: 'Popular: Collective Ownership, AGA Verification, Payment Plans',
  quickSearchPlaceholder: 'Search help topics...',
  popularTopicsLabel: 'Quick search...',
  categories: [
    {
      icon: 'rocket_launch',
      title: 'Getting Started',
      description: 'Essential guides for new members joining the GroupTown ecosystem.',
      href: '/help',
    },
    {
      icon: 'account_balance',
      title: 'S.H.O.P.',
      description: 'Shared Home Ownership Program: Documentation and process details.',
      href: '/programmes/shop',
    },
    {
      icon: 'landscape',
      title: 'S.L.O.P.',
      description: 'Shared Land Ownership Program: Mapping, titling, and legalities.',
      href: '/programmes/slop',
    },
    {
      icon: 'domain',
      title: 'Properties',
      description: 'How to view, reserve, and manage your property shares and titles.',
      href: '/properties',
    },
    {
      icon: 'badge',
      title: 'Becoming an AGA',
      description: 'Authorised GroupTown Agents: Requirements, training, and commissions.',
      href: '/agents',
    },
    {
      icon: 'admin_panel_settings',
      title: 'Accounts and Security',
      description: 'Managing your profile, two-factor authentication, and privacy settings.',
      href: '/auth/login',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqs: [
    {
      question: 'What is collective ownership?',
      answer:
        "Collective ownership allows multiple individuals to pool resources and invest in property or land. At GroupTown, this is managed through institutional-grade legal frameworks that ensure every participant's share is protected and legally documented under the appropriate Ghanaian property laws.",
    },
    {
      question: 'How do I verify a property listing?',
      answer:
        "Every listing on our platform undergoes a multi-stage verification process including title search, physical inspection, and background checks on developers. You can view the 'Verified' badge on any property page to see the specific checks completed.",
    },
    {
      question: 'What is the role of an AGA?',
      answer:
        'An Authorised GroupTown Agent (AGA) acts as a certified intermediary. They assist users with property selection, physical site tours, and navigating the legal documentation process. AGAs are trained to uphold the platform’s high standards of transparency and trust.',
    },
    {
      question: 'How are titles managed in S.L.O.P.?',
      answer:
        'Under the S.L.O.P. framework, land titles are registered through a collective trust or corporate entity where each investor holds specific rights proportional to their investment. Detailed legal instruments are executed to protect individual interests within the larger parcel.',
    },
  ],
  relatedQuestions: [
    { title: 'Payment schedules explained', href: '/help/contact' },
    { title: 'Reselling your property shares', href: '/help/contact' },
    { title: 'International investment guidelines', href: '/help/contact' },
    { title: 'Ghana Land Act overview', href: '/legal/compliance' },
  ],
  supportTitle: 'Still need help?',
  supportDescription: 'Our support team is available Monday to Friday, 9am - 5pm GMT.',
  supportHours: 'Login to track tickets',
  supportImage:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBUHMUbkMgNxtXQrT-wcNVB6TJo3X-4ToRMQCU68zuHuiCprTfUN-kvxloE_y88h_FwsAkRFqa4nwDbCzWdIH9X3P8-lekstjVuwuU5m_t0jUDqCwIU2nhBVUJvHlrIjVBwV9NcbnZlz_dX2U6_T9_HZFMqdKh9eGyhGcDzb0AEAo-9C6CTbdyEx4XsumAWDY_TMuugsV9NTrir8g5LqyvzZJXuPBvXOgfOUNwoKYY8C6D3V-IFgymBOMK_76nAL2BVT1KDAiu2dl4',
  trustTitle: 'Built for Stability',
  trustDescription:
    'Our help center is updated weekly by legal and real estate professionals to ensure you have the most accurate information for your journey towards property ownership.',
  trustItems: ['Verified Content', 'Legal Compliance'],
};

export async function getHelpPageData(): Promise<HelpPageData> {
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
      where('slug', '==', 'help'),
      where('isPublished', '==', true),
      limit(1)
    );

    const faqQuery = query(
      collection(db, 'faqs'),
      where('category', '==', 'help'),
      where('isPublished', '==', true),
      orderBy('sortOrder', 'asc'),
      limit(8)
    );

    const [pageSnapshot, faqSnapshot] = await Promise.all([getDocs(pageQuery), getDocs(faqQuery)]);

    if (pageSnapshot.empty) {
      return fallbackData;
    }

    const data = pageSnapshot.docs[0].data();

    return {
      heroTitle: String(data.heroTitle ?? fallbackData.heroTitle),
      heroSubtitle: String(data.heroSubtitle ?? fallbackData.heroSubtitle),
      quickSearchPlaceholder: String(
        data.quickSearchPlaceholder ?? fallbackData.quickSearchPlaceholder
      ),
      popularTopicsLabel: String(data.popularTopicsLabel ?? fallbackData.popularTopicsLabel),
      categories: Array.isArray(data.categories)
        ? data.categories.map((item) => ({
            icon: String(item.icon ?? 'help'),
            title: String(item.title ?? 'Category'),
            description: String(item.description ?? ''),
            href: String(item.href ?? '/help'),
          }))
        : fallbackData.categories,
      faqTitle: String(data.faqTitle ?? fallbackData.faqTitle),
      faqs: faqSnapshot.empty
        ? fallbackData.faqs
        : faqSnapshot.docs.map((doc) => {
            const faq = doc.data();
            return {
              question: String(faq.question ?? 'Question'),
              answer: String(faq.answer ?? ''),
            } satisfies HelpFaq;
          }),
      relatedQuestions: Array.isArray(data.relatedQuestions)
        ? data.relatedQuestions.map((item) => ({
            title: String(item.title ?? 'Related question'),
            href: String(item.href ?? '/help/contact'),
          }))
        : fallbackData.relatedQuestions,
      supportTitle: String(data.supportTitle ?? fallbackData.supportTitle),
      supportDescription: String(data.supportDescription ?? fallbackData.supportDescription),
      supportHours: String(data.supportHours ?? fallbackData.supportHours),
      supportImage: String(data.supportImage ?? fallbackData.supportImage),
      trustTitle: String(data.trustTitle ?? fallbackData.trustTitle),
      trustDescription: String(data.trustDescription ?? fallbackData.trustDescription),
      trustItems: Array.isArray(data.trustItems)
        ? data.trustItems.map((item) => String(item))
        : fallbackData.trustItems,
    };
  } catch {
    return fallbackData;
  }
}
