import { collection, getDocs, limit, query, where } from 'firebase/firestore';

import { getDb } from './client';
import { hasFirebaseConfig } from './config';

export type VerifyPageData = {
  title: string;
  subtitle: string;
  countdownStartSeconds: number;
  resendLabel: string;
  changePhoneLabel: string;
  verifyLabel: string;
  footnote: string;
};

const fallbackData: VerifyPageData = {
  title: 'Verify your account',
  subtitle: 'We sent a code to +233 •• ••• 1234.',
  countdownStartSeconds: 299,
  resendLabel: 'Resend code',
  changePhoneLabel: 'Change phone number',
  verifyLabel: 'Verify and continue',
  footnote:
    'By verifying, you confirm access to the registered mobile identity as per Ghanaian land ownership regulations.',
};

export async function getVerifyPageData(): Promise<VerifyPageData> {
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
      where('slug', '==', 'verify'),
      where('isPublished', '==', true),
      limit(1)
    );

    const snapshot = await getDocs(pageQuery);
    if (snapshot.empty) {
      return fallbackData;
    }

    const data = snapshot.docs[0].data();

    return {
      title: String(data.title ?? fallbackData.title),
      subtitle: String(data.subtitle ?? fallbackData.subtitle),
      countdownStartSeconds: Number(data.countdownStartSeconds ?? fallbackData.countdownStartSeconds),
      resendLabel: String(data.resendLabel ?? fallbackData.resendLabel),
      changePhoneLabel: String(data.changePhoneLabel ?? fallbackData.changePhoneLabel),
      verifyLabel: String(data.verifyLabel ?? fallbackData.verifyLabel),
      footnote: String(data.footnote ?? fallbackData.footnote),
    };
  } catch {
    return fallbackData;
  }
}
