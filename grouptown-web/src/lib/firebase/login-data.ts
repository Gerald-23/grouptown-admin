import { collection, getDocs, limit, query, where } from 'firebase/firestore';

import { getDb } from './client';
import { hasFirebaseConfig } from './config';

export type LoginPageData = {
  title: string;
  subtitle: string;
  identifierLabel: string;
  identifierPlaceholder: string;
  passwordLabel: string;
  forgotPasswordLabel: string;
  rememberLabel: string;
  submitLabel: string;
  submittingLabel: string;
  createAccountLabel: string;
  agaLabel: string;
  backLabel: string;
};

const fallbackData: LoginPageData = {
  title: 'Welcome Back',
  subtitle: 'Sign in to manage your property investments.',
  identifierLabel: 'EMAIL OR PHONE',
  identifierPlaceholder: 'Enter your email or phone number',
  passwordLabel: 'Password',
  forgotPasswordLabel: 'FORGOT PASSWORD?',
  rememberLabel: 'Remember me for 30 days',
  submitLabel: 'Log in',
  submittingLabel: 'AUTHENTICATING...',
  createAccountLabel: 'Create an account',
  agaLabel: 'LEARN ABOUT BECOMING AN AGA',
  backLabel: 'BACK TO PUBLIC WEBSITE',
};

export async function getLoginPageData(): Promise<LoginPageData> {
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
      where('slug', '==', 'login'),
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
      identifierLabel: String(data.identifierLabel ?? fallbackData.identifierLabel),
      identifierPlaceholder: String(data.identifierPlaceholder ?? fallbackData.identifierPlaceholder),
      passwordLabel: String(data.passwordLabel ?? fallbackData.passwordLabel),
      forgotPasswordLabel: String(data.forgotPasswordLabel ?? fallbackData.forgotPasswordLabel),
      rememberLabel: String(data.rememberLabel ?? fallbackData.rememberLabel),
      submitLabel: String(data.submitLabel ?? fallbackData.submitLabel),
      submittingLabel: String(data.submittingLabel ?? fallbackData.submittingLabel),
      createAccountLabel: String(data.createAccountLabel ?? fallbackData.createAccountLabel),
      agaLabel: String(data.agaLabel ?? fallbackData.agaLabel),
      backLabel: String(data.backLabel ?? fallbackData.backLabel),
    };
  } catch {
    return fallbackData;
  }
}
