import { collection, deleteDoc, doc, getDocs, limit, orderBy, query } from 'firebase/firestore';

import { getDb } from './client';

export type CommunityAdminPost = {
  id: string;
  authorName: string;
  body: string;
  attachmentCount: number;
  createdAtLabel: string;
};

function createdAtLabel(value: unknown) {
  const date = (value as { toDate?: () => Date } | null)?.toDate?.();
  return date ? date.toLocaleString('en-GH', { dateStyle: 'medium', timeStyle: 'short' }) : 'Recent';
}

export async function getCommunityAdminPosts() {
  const db = getDb();
  if (!db) return [];
  const snapshot = await getDocs(query(collection(db, 'communityPosts'), orderBy('createdAt', 'desc'), limit(100)));
  return snapshot.docs.map((entry): CommunityAdminPost => {
    const data = entry.data() as { authorName?: string; body?: string; attachments?: unknown[]; createdAt?: unknown };
    return {
      id: entry.id,
      authorName: data.authorName?.trim() || 'GroupTown member',
      body: data.body?.trim() || 'Media post',
      attachmentCount: Array.isArray(data.attachments) ? data.attachments.length : 0,
      createdAtLabel: createdAtLabel(data.createdAt),
    };
  });
}

export async function deleteCommunityPost(postId: string) {
  const db = getDb();
  if (!db) throw new Error('Firebase is unavailable.');
  await deleteDoc(doc(db, 'communityPosts', postId));
}
