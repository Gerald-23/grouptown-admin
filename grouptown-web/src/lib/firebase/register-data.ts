import { collection, getDocs, limit, query, where } from 'firebase/firestore';

import { getDb } from './client';
import { hasFirebaseConfig } from './config';

export type RegisterPageData = {
  title: string;
  subtitle: string;
  phonePrefix: string;
  phoneFlagImage: string;
  passwordChecklist: string[];
  termsLabel: string;
  marketingLabel: string;
  submitLabel: string;
  agaTitle: string;
  agaDescription: string;
};

const fallbackData: RegisterPageData = {
  title: 'Create your GroupTown account',
  subtitle: "Join Ghana's most trusted collective property platform.",
  phonePrefix: '+233',
  phoneFlagImage:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAcRgMe5FgeOHEq_ix-jvo8C8o6TKX_S_BJ6bhDhamYxGL5Ikpf0cljUQNuABZJArzmRy9Xd1RNR-r88au84UpDwP333NquxD34IQdT60N2Vbjl5Wo4zHjdomogK0TRO0SYN7wFCjs3hnrEDCkc5MvOraiIn0ySLHpQmWomdvHEW1Zg4xV-UcdJGLtiH97RB0JGXgtm8g6-mB1E71LCEC8KUAmr9NQFmwo317k06djh-zbNy_7cffMKt8-7vQhUuR8JJO02z0X9ZiY',
  passwordChecklist: ['Minimum 8 characters', 'One special character or number'],
  termsLabel: 'I agree to the Terms of Service and Privacy Policy.',
  marketingLabel: 'Send me monthly property market insights and community updates (Optional).',
  submitLabel: 'Create Account',
  agaTitle: 'Automated Ghana Audit (AGA) Integration',
  agaDescription:
    'Your identity will be verified through our institutional legal framework to ensure secure collective ownership.',
};

export async function getRegisterPageData(): Promise<RegisterPageData> {
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
      where('slug', '==', 'register'),
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
      phonePrefix: String(data.phonePrefix ?? fallbackData.phonePrefix),
      phoneFlagImage: String(data.phoneFlagImage ?? fallbackData.phoneFlagImage),
      passwordChecklist: Array.isArray(data.passwordChecklist)
        ? data.passwordChecklist.map((item) => String(item))
        : fallbackData.passwordChecklist,
      termsLabel: String(data.termsLabel ?? fallbackData.termsLabel),
      marketingLabel: String(data.marketingLabel ?? fallbackData.marketingLabel),
      submitLabel: String(data.submitLabel ?? fallbackData.submitLabel),
      agaTitle: String(data.agaTitle ?? fallbackData.agaTitle),
      agaDescription: String(data.agaDescription ?? fallbackData.agaDescription),
    };
  } catch {
    return fallbackData;
  }
}
