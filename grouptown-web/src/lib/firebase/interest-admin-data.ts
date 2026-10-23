import { collection, doc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { httpsCallable } from 'firebase/functions';

import { getDb, getFunctionsClient, getStorageClient } from './client';
import type { PaymentTerm } from './cohort-admin-data';

export type ShopInterestAdminRecord = {
  id: string;
  programmeId: string;
  label: string;
  description: string;
  imageUrl: string;
  status: 'draft' | 'published';
  cohortId: string | null;
  maxMembers: number | null;
  groupSizeOptions: number[];
  price: number | null;
  paymentTerms: PaymentTerm[];
  monthlyPayment: number | null;
  paymentTerm: string;
};

export type WaitingInterestAdminRecord = {
  id: string;
  requestedHome: string;
  userName: string;
  status: string;
  monthlyBudget: number | null;
};

function interestId(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export const starterHouseTypes = [
  { label: 'Detached House', description: 'A standalone home on its own plot, offering privacy and flexible outdoor space.' },
  { label: 'Semi-Detached House', description: 'A home joined to one neighbouring home, balancing privacy, space, and affordability.' },
  { label: 'Townhouse', description: 'A multi-level home in a connected row, designed for practical modern family living.' },
  { label: 'Apartment', description: 'A secure, low-maintenance home within a shared residential building.' },
  { label: 'Bungalow', description: 'A comfortable single-level home with living spaces arranged on one floor.' },
] as const;

// These are indicative catalogue entries for the first public launch. Prices and
// monthly figures must still be confirmed by the business before advertising them.
export const recommendedStandaloneInterests = [
  { label: 'Studio Starter Apartment', description: 'A compact, affordable home for a first-time homeowner or young professional.', price: 180000, monthlyPayment: 1500, paymentTerms: ['5 Years', '10 Years', '15 Years', '20 Years'] as PaymentTerm[], imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80' },
  { label: '1-Bedroom Starter Apartment', description: 'A practical first home with a private bedroom and low-maintenance shared amenities.', price: 260000, monthlyPayment: 2100, paymentTerms: ['5 Years', '10 Years', '15 Years', '20 Years'] as PaymentTerm[], imageUrl: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80' },
  { label: '2-Bedroom Garden Apartment', description: 'A comfortable two-bedroom apartment with room for outdoor living and a growing family.', price: 420000, monthlyPayment: 3400, paymentTerms: ['5 Years', '10 Years', '15 Years', '20 Years', '25 Years'] as PaymentTerm[], imageUrl: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80' },
  { label: '2-Bedroom Semi-Detached Home', description: 'A private two-bedroom home that balances outdoor space, security, and value.', price: 500000, monthlyPayment: 4000, paymentTerms: ['10 Years', '15 Years', '20 Years', '25 Years'] as PaymentTerm[], imageUrl: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=80' },
  { label: '3-Bedroom Family Villa', description: 'A family-sized villa with generous living space and a private outdoor area.', price: 700000, monthlyPayment: 5600, paymentTerms: ['10 Years', '15 Years', '20 Years', '25 Years', '30 Years'] as PaymentTerm[], imageUrl: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80' },
  { label: '3-Bedroom Bungalow', description: 'A single-level family home designed for simple movement and comfortable everyday living.', price: 650000, monthlyPayment: 5200, paymentTerms: ['10 Years', '15 Years', '20 Years', '25 Years'] as PaymentTerm[], imageUrl: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=80' },
  { label: '4-Bedroom Duplex', description: 'A larger multi-level home for families who need flexible rooms and shared spaces.', price: 900000, monthlyPayment: 7200, paymentTerms: ['15 Years', '20 Years', '25 Years', '30 Years'] as PaymentTerm[], imageUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80' },
  { label: '4-Bedroom Executive Villa', description: 'A premium villa with spacious rooms, privacy, and an elevated finish.', price: 1200000, monthlyPayment: 9500, paymentTerms: ['15 Years', '20 Years', '25 Years', '30 Years'] as PaymentTerm[], imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80' },
  { label: '4-Bedroom Townhouse', description: 'A modern connected home offering security, convenience, and efficient family living.', price: 800000, monthlyPayment: 6400, paymentTerms: ['10 Years', '15 Years', '20 Years', '25 Years', '30 Years'] as PaymentTerm[], imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80' },
  { label: '5-Bedroom Detached Villa', description: 'A spacious private villa for large households, guests, and long-term family plans.', price: 1500000, monthlyPayment: 12000, paymentTerms: ['15 Years', '20 Years', '25 Years', '30 Years'] as PaymentTerm[], imageUrl: 'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1200&q=80' },
] as const;

export async function publishRecommendedStandaloneInterests() {
  for (const interest of recommendedStandaloneInterests) {
    const id = await saveShopInterestDraft({ ...interest, paymentTerm: interest.paymentTerms[0], groupSizeOptions: [6, 12, 18, 24, 36] });
    await publishGlobalShopInterest({ id, ...interest, paymentTerm: interest.paymentTerms[0], groupSizeOptions: [6, 12, 18, 24, 36] });
  }
}

export async function saveStarterHouseTypes() {
  await Promise.all(starterHouseTypes.map((house) => saveShopInterestDraft({
    label: house.label,
    description: house.description,
    imageUrl: '',
    price: null,
    monthlyPayment: null,
    paymentTerm: '',
  })));
}

export async function getInterestManagement(programmeId: string) {
  const db = getDb();
  if (!db) return { interests: [] as ShopInterestAdminRecord[], requests: [] as WaitingInterestAdminRecord[] };

  const [interestSnap, requestSnap] = await Promise.all([
    getDocs(collection(db, 'shopInterests')),
    getDocs(collection(db, 'waitingInterestRequests')),
  ]);

  return {
    interests: interestSnap.docs
      .map((entry): ShopInterestAdminRecord => {
        const data = entry.data() as Partial<ShopInterestAdminRecord>;
        return {
          id: entry.id,
          programmeId: data.programmeId ?? '',
          label: data.label ?? entry.id,
          description: data.description ?? '',
          imageUrl: data.imageUrl ?? '',
          status: data.status === 'published' ? 'published' : 'draft',
          cohortId: data.cohortId ?? null,
          maxMembers: Number(data.maxMembers) || null,
          groupSizeOptions: Array.isArray(data.groupSizeOptions) ? data.groupSizeOptions.filter((size): size is number => typeof size === 'number') : [],
          price: Number(data.price) || null,
          paymentTerms: Array.isArray(data.paymentTerms) ? data.paymentTerms : [],
          monthlyPayment: Number((data as { monthlyPayment?: number }).monthlyPayment) || null,
          paymentTerm: String((data as { paymentTerm?: string }).paymentTerm ?? ''),
        };
      })
      .filter((item) => item.programmeId === programmeId),
    requests: requestSnap.docs
      .map((entry): WaitingInterestAdminRecord & { programmeId?: string } => {
        const data = entry.data() as Partial<WaitingInterestAdminRecord> & { programmeId?: string };
        return { id: entry.id, requestedHome: data.requestedHome || 'Home request', userName: data.userName || 'Member', status: data.status || 'submitted', monthlyBudget: Number(data.monthlyBudget) || null, programmeId: data.programmeId };
      })
      .filter((item) => item.programmeId === programmeId)
      .map(({ programmeId: _programmeId, ...item }) => item),
  };
}

export async function getGlobalInterestManagement() {
  const db = getDb();
  if (!db) return { interests: [] as ShopInterestAdminRecord[], requests: [] as WaitingInterestAdminRecord[] };
  const [snap, requestSnap] = await Promise.all([
    getDocs(collection(db, 'shopInterests')),
    getDocs(collection(db, 'waitingInterestRequests')),
  ]);
  return {
    interests: snap.docs.map((entry): ShopInterestAdminRecord => {
      const data = entry.data() as Partial<ShopInterestAdminRecord>;
      return {
        id: entry.id,
        programmeId: data.programmeId ?? '',
        label: data.label ?? entry.id,
        description: data.description ?? '',
        imageUrl: data.imageUrl ?? '',
        status: data.status === 'published' ? 'published' : 'draft',
        cohortId: data.cohortId ?? null,
        maxMembers: Number(data.maxMembers) || null,
        groupSizeOptions: Array.isArray(data.groupSizeOptions) ? data.groupSizeOptions.filter((size): size is number => typeof size === 'number') : [],
        price: Number(data.price) || null,
        paymentTerms: Array.isArray(data.paymentTerms) ? data.paymentTerms : [],
        monthlyPayment: Number((data as { monthlyPayment?: number }).monthlyPayment) || null,
        paymentTerm: String((data as { paymentTerm?: string }).paymentTerm ?? ''),
      };
    }).filter((item) => !item.programmeId && !item.cohortId),
    requests: requestSnap.docs
      .map((entry): WaitingInterestAdminRecord & { programmeId?: string | null } => {
        const data = entry.data() as Partial<WaitingInterestAdminRecord> & { programmeId?: string | null };
        return { id: entry.id, requestedHome: data.requestedHome || 'Home request', userName: data.userName || 'Member', status: data.status || 'submitted', monthlyBudget: Number(data.monthlyBudget) || null, programmeId: data.programmeId };
      })
      .filter((item) => !item.programmeId)
      .map(({ programmeId: _programmeId, ...item }) => item),
  };
}

export async function saveShopInterestDraft(input: { programmeId?: string | null; label: string; description: string; imageUrl: string; price?: number | null; monthlyPayment?: number | null; paymentTerm?: string; paymentTerms?: PaymentTerm[]; groupSizeOptions?: number[] }) {
  const db = getDb();
  const id = interestId(input.label);
  if (!db || !id) throw new Error('A Firebase connection and interest name are required.');

  await setDoc(doc(db, 'shopInterests', id), {
    programmeId: input.programmeId ?? null,
    label: input.label.trim(),
    description: input.description.trim(),
    imageUrl: input.imageUrl.trim(),
    price: input.price ?? null,
    monthlyPayment: input.monthlyPayment ?? null,
    paymentTerm: input.paymentTerm?.trim() || null,
    paymentTerms: input.paymentTerms?.length ? input.paymentTerms : input.paymentTerm?.trim() ? [input.paymentTerm.trim() as PaymentTerm] : [],
    groupSizeOptions: input.groupSizeOptions?.length ? input.groupSizeOptions : null,
    status: 'draft',
    updatedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  }, { merge: true });
  return id;
}

export async function uploadShopInterestImage(label: string, file: File) {
  const storage = getStorageClient();
  if (!storage) throw new Error('Firebase Storage is not configured.');
  const safeName = `${interestId(label) || 'interest'}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
  const imageRef = ref(storage, `shop-interests/${safeName}`);
  await uploadBytes(imageRef, file, { contentType: file.type || 'image/jpeg' });
  return getDownloadURL(imageRef);
}

export async function publishGlobalShopInterest(input: { id: string; label: string; description: string; imageUrl: string; price?: number | null; monthlyPayment?: number | null; paymentTerm?: string; paymentTerms?: PaymentTerm[]; groupSizeOptions?: number[] }) {
  const functions = getFunctionsClient();
  if (!functions) throw new Error('Firebase Functions are unavailable.');
  const publish = httpsCallable<{ interest: typeof input }, { ok?: boolean }>(functions, 'publishGlobalShopInterest');
  const result = await publish({ interest: input });
  if (!result.data?.ok) throw new Error('The global interest could not be published.');
}

export async function launchShopInterest(input: {
  id: string; programmeId: string; label: string; description: string; imageUrl: string;
  cohortId: string; maxMembers: number; price: number; downPaymentRate: number; paymentTerms: PaymentTerm[];
}) {
  const functions = getFunctionsClient();
  if (!functions) throw new Error('Firebase Functions are unavailable.');
  const launch = httpsCallable<{ interest: typeof input }, { ok?: boolean }>(functions, 'launchShopInterest');
  const result = await launch({ interest: input });
  if (!result.data?.ok) throw new Error('The interest could not be launched.');
}
