import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';

import { getDb, getFunctionsClient } from './client';

export type AdminGroupCreationRequest = {
  id: string;
  requesterName: string;
  requesterEmail: string;
  categoryLabel: string;
  notes: string;
  status: 'pending_review' | 'approved' | 'declined';
  maxMembers: number;
};

export async function getPendingGroupCreationRequests(): Promise<AdminGroupCreationRequest[]> {
  const db = getDb();

  if (!db) {
    return [];
  }

  try {
    const snapshot = await getDocs(
      query(collection(db, 'groupCreationRequests'), where('status', '==', 'pending_review'), limit(50))
    );

    return snapshot.docs.map((entry) => {
      const data = entry.data();
      const interestLabel = typeof data.interestLabel === 'string' ? data.interestLabel : 'Home type pending';
      const paymentTerm = typeof data.paymentTerm === 'string' ? data.paymentTerm : 'Payment plan pending';

      return {
        id: entry.id,
        requesterName: typeof data.requesterName === 'string' ? data.requesterName : 'Unnamed member',
        requesterEmail: typeof data.requesterEmail === 'string' ? data.requesterEmail : 'No email',
        categoryLabel: `${interestLabel} / ${paymentTerm}`,
        notes: typeof data.notes === 'string' && data.notes.trim() ? data.notes.trim() : 'No note provided.',
        status: 'pending_review',
        maxMembers: typeof data.maxMembers === 'number' ? data.maxMembers : 12,
      };
    });
  } catch {
    return [];
  }
}

async function callReviewFunction(functionName: 'approveGroupCreationRequest' | 'declineGroupCreationRequest', requestId: string) {
  const functions = getFunctionsClient();

  if (!functions) {
    return false;
  }

  try {
    const review = httpsCallable<{ requestId: string }, { ok?: boolean }>(functions, functionName);
    const result = await review({ requestId });
    return result.data?.ok === true;
  } catch {
    return false;
  }
}

export function approveGroupCreationRequest(requestId: string) {
  return callReviewFunction('approveGroupCreationRequest', requestId);
}

export function declineGroupCreationRequest(requestId: string) {
  return callReviewFunction('declineGroupCreationRequest', requestId);
}
