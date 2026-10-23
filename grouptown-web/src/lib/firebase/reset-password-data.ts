import { collection, getDocs, limit, query, where } from 'firebase/firestore';

import { getDb } from './client';
import { hasFirebaseConfig } from './config';

export type ResetPasswordPageData = {
  supportLabel: string;
  backLabel: string;
  title: string;
  description: string;
  identifierLabel: string;
  identifierPlaceholder: string;
  submitLabel: string;
  contactSupportLabel: string;
  footerTagline: string;
  footerCopyright: string;
  contextualCaption: string;
};

const fallbackData: ResetPasswordPageData = {
  supportLabel: 'Support',
  backLabel: 'Back to login',
  title: 'Reset your password',
  description:
    "Enter the email address or phone number connected to your account. If a matching account is available, we'll send recovery instructions.",
  identifierLabel: 'Email or Phone Number',
  identifierPlaceholder: 'name@example.com',
  submitLabel: 'Send recovery instructions',
  contactSupportLabel: 'Need help? Contact Support',
  footerTagline: 'Institutional Property Management | Securing Ghanaian Land Ownership',
  footerCopyright:
    '© 2024 GroupTown Ghana. All rights reserved. Institutional Property Management.',
  contextualCaption: 'Recovery UI is ready. Recovery delivery will be connected next.',
};

export async function getResetPasswordPageData(): Promise<ResetPasswordPageData> {
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
      where('slug', '==', 'reset-password'),
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
      backLabel: String(data.backLabel ?? fallbackData.backLabel),
      title: String(data.title ?? fallbackData.title),
      description: String(data.description ?? fallbackData.description),
      identifierLabel: String(data.identifierLabel ?? fallbackData.identifierLabel),
      identifierPlaceholder: String(data.identifierPlaceholder ?? fallbackData.identifierPlaceholder),
      submitLabel: String(data.submitLabel ?? fallbackData.submitLabel),
      contactSupportLabel: String(data.contactSupportLabel ?? fallbackData.contactSupportLabel),
      footerTagline: String(data.footerTagline ?? fallbackData.footerTagline),
      footerCopyright: String(data.footerCopyright ?? fallbackData.footerCopyright),
      contextualCaption: String(data.contextualCaption ?? fallbackData.contextualCaption),
    };
  } catch {
    return fallbackData;
  }
}
