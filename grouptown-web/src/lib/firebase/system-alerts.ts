import { collection, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc, type QueryDocumentSnapshot } from 'firebase/firestore';

import { getAuthClient, getDb } from '@/lib/firebase/client';

export type SystemAlertRecord = {
  id: string;
  sourceApp: string;
  sourceArea: string;
  issueType: string;
  severity: string;
  status: 'open' | 'resolved';
  code: string;
  message: string;
  fingerprint: string;
  userId: string;
  userEmail: string;
  createdAtLabel: string;
  updatedAtLabel: string;
};

type FirestoreSystemAlert = Partial<{
  sourceApp: string;
  sourceArea: string;
  issueType: string;
  severity: string;
  status: 'open' | 'resolved';
  code: string;
  message: string;
  fingerprint: string;
  userId: string;
  userEmail: string;
  createdAt: { toDate?: () => Date };
  updatedAt: { toDate?: () => Date };
}>;

function buildFingerprint(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120) || 'system-alert';
}

function formatTimestamp(value?: { toDate?: () => Date }) {
  const date = value?.toDate?.();

  if (!date) {
    return 'Pending timestamp';
  }

  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function mapAlert(entry: QueryDocumentSnapshot) {
  const data = entry.data() as FirestoreSystemAlert;
  return {
    id: entry.id,
    sourceApp: data.sourceApp?.trim() || 'unknown',
    sourceArea: data.sourceArea?.trim() || 'unknown',
    issueType: data.issueType?.trim() || 'system',
    severity: data.severity?.trim() || 'high',
    status: data.status ?? 'open',
    code: data.code?.trim() || '',
    message: data.message?.trim() || 'Unknown system issue',
    fingerprint: data.fingerprint?.trim() || entry.id,
    userId: data.userId?.trim() || '',
    userEmail: data.userEmail?.trim() || '',
    createdAtLabel: formatTimestamp(data.createdAt),
    updatedAtLabel: formatTimestamp(data.updatedAt),
  } satisfies SystemAlertRecord;
}

export async function logAdminSystemAlert(input: {
  message: string;
  sourceArea: string;
  code?: string;
}) {
  const db = getDb();
  const authClient = getAuthClient();
  const currentUser = authClient?.currentUser;

  if (!db || !currentUser) {
    return;
  }

  const fingerprint = buildFingerprint(`admin-web-${input.sourceArea}-${input.code ?? 'none'}-${input.message}`);
  await setDoc(
    doc(db, 'systemAlerts', fingerprint),
    {
      sourceApp: 'admin-web',
      sourceArea: input.sourceArea,
      issueType: 'system',
      severity: 'high',
      status: 'open',
      code: input.code ?? '',
      message: input.message,
      fingerprint,
      userId: currentUser.uid,
      userEmail: currentUser.email ?? '',
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export function subscribeToSystemAlerts(
  callback: (alerts: SystemAlertRecord[]) => void
) {
  const db = getDb();

  if (!db) {
    callback([]);
    return () => undefined;
  }

  const alertsQuery = query(collection(db, 'systemAlerts'), orderBy('updatedAt', 'desc'));
  return onSnapshot(
    alertsQuery,
    (snapshot) => {
      callback(snapshot.docs.map((entry) => mapAlert(entry)));
    },
    () => {
      callback([]);
    }
  );
}

export async function resolveSystemAlert(alertId: string) {
  const db = getDb();
  const authClient = getAuthClient();
  const currentUser = authClient?.currentUser;

  if (!db || !currentUser) {
    return false;
  }

  await updateDoc(doc(db, 'systemAlerts', alertId), {
    status: 'resolved',
    resolvedBy: currentUser.uid,
    resolvedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return true;
}
