import { collection, getDocs, limit, query, where } from 'firebase/firestore';

import { getDb } from './client';
import { hasFirebaseConfig } from './config';

export type ContactCard = {
  icon: string;
  title: string;
  description: string;
  primary: string;
  secondary?: string;
};

export type ContactTopic = {
  label: string;
  value: string;
};

export type ContactFooterLink = {
  label: string;
  href: string;
};

export type ContactPageData = {
  supportLabel: string;
  title: string;
  intro: string;
  cards: ContactCard[];
  formTitle: string;
  formDescription: string;
  topics: ContactTopic[];
  responseTime: string;
  officeTitle: string;
  officeAddress: string[];
  officeImage: string;
  officeBadge: string;
  corporateTitle: string;
  corporateDescription: string;
  corporateEmail: string;
  footerCompanyLinks: ContactFooterLink[];
  footerLegalLinks: ContactFooterLink[];
  footerSupportLinks: ContactFooterLink[];
};

const fallbackData: ContactPageData = {
  supportLabel: 'SUPPORT CENTER',
  title: 'Contact Us',
  intro:
    "Whether you're looking to join a collective home ownership program or have questions about land acquisition in Ghana, our team is here to provide institutional-grade support.",
  cards: [
    {
      icon: 'call',
      title: 'Phone',
      description: 'Direct institutional line for general inquiries.',
      primary: '+233 (0) 30 200 0000',
    },
    {
      icon: 'chat',
      title: 'WhatsApp',
      description: 'Instant messaging for quick updates and documentation.',
      primary: '+233 (0) 55 100 0000',
    },
    {
      icon: 'mail',
      title: 'Email',
      description: 'Official correspondence and legal inquiries.',
      primary: 'support@grouptown.com.gh',
    },
    {
      icon: 'schedule',
      title: 'Hours',
      description: 'Mon — Fri: 8:00am - 5:00pm',
      primary: 'Sat: 9:00am - 1:00pm (GMT)',
    },
  ],
  formTitle: 'Send an Enquiry',
  formDescription:
    'Please complete the form below. All fields marked with an asterisk are mandatory.',
  topics: [
    { label: 'S.H.O.P. (Shared Home Ownership)', value: 'shop' },
    { label: 'S.L.O.P. (Shared Land Ownership)', value: 'slop' },
    { label: 'House Rental', value: 'rental' },
    { label: 'House Sale', value: 'sale' },
    { label: 'AGA (Asset Generation Account)', value: 'aga' },
    { label: 'Account Help', value: 'account' },
    { label: 'General', value: 'general' },
  ],
  responseTime: 'Expected response time: Within 24-48 business hours.',
  officeTitle: 'Approved Office Location',
  officeAddress: [
    'Plot 45, Independence Avenue,',
    'Ridge, Accra, Ghana',
    'Digital Address: GA-102-4567',
  ],
  officeImage:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBxPbqInz4VFIwqIIF6mymUINdlrJ8gz-2vyG45LR1kFauQajSNkSpf3m3Qmm6vrH19EbQfJ8T7V-RrCkC3cjsYRhc_hyOpPwzEroJDwwumtWhdyHWK-DFESqJLErMJMAC-QnyPyDG6j6FLpL_ro6gUQ3C4hQHgdA05d2Q7-RmSSh2AIQPzaXxjyz40kayQvpGffwb0-eEbGGywtZTgsAL_ughMOjh1GtX52eLCriiZBZmwjmUNNAbSDZLsZ8zoJDQXmNr7jFaqHIo',
  officeBadge: 'HQ OFFICE',
  corporateTitle: 'Corporate Support',
  corporateDescription:
    'For institutional partnerships, legal matters, or investor relations, please contact our administrative desk directly.',
  corporateEmail: 'admin@grouptown.com.gh',
  footerCompanyLinks: [
    { label: 'About', href: '/about' },
    { label: 'Investor Relations', href: '/about' },
    { label: 'Partner Portal', href: '/about' },
  ],
  footerLegalLinks: [
    { label: 'Terms of Service', href: '/legal/terms' },
    { label: 'Privacy Policy', href: '/legal/privacy' },
    { label: 'Land Act Compliance', href: '/legal/compliance' },
  ],
  footerSupportLinks: [
    { label: 'Contact Support', href: '/help/contact' },
    { label: 'FAQ', href: '/help/faq' },
  ],
};

export async function getContactPageData(): Promise<ContactPageData> {
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
      where('slug', '==', 'contact'),
      where('isPublished', '==', true),
      limit(1)
    );

    const snapshot = await getDocs(pageQuery);
    if (snapshot.empty) {
      return fallbackData;
    }

    const data = snapshot.docs[0].data();

    return {
      supportLabel: String(data.supportLabel ?? fallbackData.supportLabel),
      title: String(data.title ?? fallbackData.title),
      intro: String(data.intro ?? fallbackData.intro),
      cards: Array.isArray(data.cards)
        ? data.cards.map((item) => ({
            icon: String(item.icon ?? 'help'),
            title: String(item.title ?? 'Contact'),
            description: String(item.description ?? ''),
            primary: String(item.primary ?? ''),
            secondary: item.secondary ? String(item.secondary) : undefined,
          }))
        : fallbackData.cards,
      formTitle: String(data.formTitle ?? fallbackData.formTitle),
      formDescription: String(data.formDescription ?? fallbackData.formDescription),
      topics: Array.isArray(data.topics)
        ? data.topics.map((item) => ({
            label: String(item.label ?? 'General'),
            value: String(item.value ?? 'general'),
          }))
        : fallbackData.topics,
      responseTime: String(data.responseTime ?? fallbackData.responseTime),
      officeTitle: String(data.officeTitle ?? fallbackData.officeTitle),
      officeAddress: Array.isArray(data.officeAddress)
        ? data.officeAddress.map((item) => String(item))
        : fallbackData.officeAddress,
      officeImage: String(data.officeImage ?? fallbackData.officeImage),
      officeBadge: String(data.officeBadge ?? fallbackData.officeBadge),
      corporateTitle: String(data.corporateTitle ?? fallbackData.corporateTitle),
      corporateDescription: String(
        data.corporateDescription ?? fallbackData.corporateDescription
      ),
      corporateEmail: String(data.corporateEmail ?? fallbackData.corporateEmail),
      footerCompanyLinks: Array.isArray(data.footerCompanyLinks)
        ? data.footerCompanyLinks.map((item) => ({
            label: String(item.label ?? 'Link'),
            href: String(item.href ?? '/'),
          }))
        : fallbackData.footerCompanyLinks,
      footerLegalLinks: Array.isArray(data.footerLegalLinks)
        ? data.footerLegalLinks.map((item) => ({
            label: String(item.label ?? 'Link'),
            href: String(item.href ?? '/'),
          }))
        : fallbackData.footerLegalLinks,
      footerSupportLinks: Array.isArray(data.footerSupportLinks)
        ? data.footerSupportLinks.map((item) => ({
            label: String(item.label ?? 'Link'),
            href: String(item.href ?? '/'),
          }))
        : fallbackData.footerSupportLinks,
    };
  } catch {
    return fallbackData;
  }
}
