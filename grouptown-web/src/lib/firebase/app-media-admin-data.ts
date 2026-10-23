import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import { getDb, getStorageClient } from './client';

export const appMediaSlots = [
  { id: 'brandLogo', label: 'GroupTown logo', description: 'Launch screen and in-app GroupTown mark.', folder: 'brand/logo' },
  { id: 'homeTwoBedroom', label: '2-bedroom home', description: 'Home, listed-interest, property and calculator cards.', folder: 'homes/two-bedroom' },
  { id: 'homeThreeBedroom', label: '3-bedroom home', description: 'Home, listed-interest, property and calculator cards.', folder: 'homes/three-bedroom' },
  { id: 'homeVilla', label: 'Villa and group cover', description: 'Home villa card, property detail fallback and group cover.', folder: 'homes/villa' },
  { id: 'onboardingOne', label: 'Onboarding step one', description: 'The first S.H.O.P. onboarding screen.', folder: 'onboarding/one' },
  { id: 'onboardingTwo', label: 'Onboarding step two', description: 'The second S.H.O.P. onboarding screen.', folder: 'onboarding/two' },
] as const;

export type AppMediaSlotId = (typeof appMediaSlots)[number]['id'];

export type AdminAppMediaAsset = {
  url: string;
  storagePath: string;
  alt: string;
  updatedAtLabel: string;
};

type StoredAsset = Partial<AdminAppMediaAsset> & { updatedAt?: { toDate?: () => Date } };

function normalizeAssets(value: unknown): Partial<Record<AppMediaSlotId, AdminAppMediaAsset>> {
  if (!value || typeof value !== 'object') {
    return {};
  }

  const allowedIds = new Set<string>(appMediaSlots.map((item) => item.id));
  const entries = Object.entries(value as Record<string, unknown>).flatMap(([id, item]) => {
    if (!allowedIds.has(id) || !item || typeof item !== 'object') {
      return [];
    }

    const asset = item as StoredAsset;
    const url = typeof asset.url === 'string' ? asset.url.trim() : '';
    if (!url) {
      return [];
    }

    const updatedAt = asset.updatedAt?.toDate?.();
    return [[id as AppMediaSlotId, {
      url,
      storagePath: typeof asset.storagePath === 'string' ? asset.storagePath : '',
      alt: typeof asset.alt === 'string' ? asset.alt : '',
      updatedAtLabel: updatedAt ? updatedAt.toLocaleString() : 'Recently updated',
    }] as const];
  });

  return Object.fromEntries(entries) as Partial<Record<AppMediaSlotId, AdminAppMediaAsset>>;
}

export function subscribeToAppMedia(callback: (assets: Partial<Record<AppMediaSlotId, AdminAppMediaAsset>>) => void) {
  const db = getDb();
  if (!db) {
    callback({});
    return () => undefined;
  }

  return onSnapshot(
    doc(db, 'siteContent', 'media'),
    (snapshot) => callback(normalizeAssets(snapshot.data()?.assets)),
    () => callback({})
  );
}

export async function uploadAppMedia(slot: (typeof appMediaSlots)[number], file: File) {
  const db = getDb();
  const storage = getStorageClient();

  if (!db || !storage) {
    throw new Error('Firebase storage is not configured in this web workspace.');
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('Select an image file.');
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error('App images must be smaller than 10 MB.');
  }

  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]+/g, '-')}`;
  const storagePath = `app-media/${slot.folder}/${safeName}`;
  const mediaRef = ref(storage, storagePath);

  await uploadBytes(mediaRef, file, {
    contentType: file.type,
    customMetadata: {
      mediaSlot: slot.id,
      uploadedFrom: 'grouptown-web-admin',
    },
  });

  const url = await getDownloadURL(mediaRef);
  await setDoc(
    doc(db, 'siteContent', 'media'),
    {
      assets: {
        [slot.id]: {
          url,
          storagePath,
          alt: slot.label,
          updatedAt: serverTimestamp(),
        },
      },
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return url;
}
