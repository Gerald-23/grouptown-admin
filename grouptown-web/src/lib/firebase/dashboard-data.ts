import { collection, getDocs, limit, query, where } from 'firebase/firestore';

import { getDb } from './client';
import { hasFirebaseConfig } from './config';

export type DashboardState =
  | 'active-participant'
  | 'new-user'
  | 'action-required'
  | 'loading'
  | 'error';

export type DashboardPageData = {
  workspaceLabel: string;
  workspaceName: string;
  pageTitle: string;
  currentUserName: string;
  currentUserRole: string;
  supportLabel: string;
  supportDescription: string;
  supportButtonLabel: string;
  defaultState: DashboardState;
};

const fallbackData: DashboardPageData = {
  workspaceLabel: 'Customer Workspace',
  workspaceName: 'Personal Portfolio',
  pageTitle: 'Dashboard',
  currentUserName: 'Alexander Sterling',
  currentUserRole: 'Verified',
  supportLabel: 'Assistance',
  supportDescription: 'Dedicated support is available 09:00 - 17:00 for active participants.',
  supportButtonLabel: 'Contact Officer',
  defaultState: 'active-participant',
};

export async function getDashboardPageData(): Promise<DashboardPageData> {
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
      where('slug', '==', 'dashboard'),
      where('isPublished', '==', true),
      limit(1)
    );

    const snapshot = await getDocs(pageQuery);
    if (snapshot.empty) {
      return fallbackData;
    }

    const data = snapshot.docs[0].data();
    const allowedStates: DashboardState[] = [
      'active-participant',
      'new-user',
      'action-required',
      'loading',
      'error',
    ];
    const defaultState = String(data.defaultState ?? fallbackData.defaultState) as DashboardState;

    return {
      workspaceLabel: String(data.workspaceLabel ?? fallbackData.workspaceLabel),
      workspaceName: String(data.workspaceName ?? fallbackData.workspaceName),
      pageTitle: String(data.pageTitle ?? fallbackData.pageTitle),
      currentUserName: String(data.currentUserName ?? fallbackData.currentUserName),
      currentUserRole: String(data.currentUserRole ?? fallbackData.currentUserRole),
      supportLabel: String(data.supportLabel ?? fallbackData.supportLabel),
      supportDescription: String(data.supportDescription ?? fallbackData.supportDescription),
      supportButtonLabel: String(data.supportButtonLabel ?? fallbackData.supportButtonLabel),
      defaultState: allowedStates.includes(defaultState) ? defaultState : fallbackData.defaultState,
    };
  } catch {
    return fallbackData;
  }
}
