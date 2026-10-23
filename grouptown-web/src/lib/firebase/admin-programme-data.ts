import { arrayUnion, collection, doc, getDoc, getDocs, limit, query, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import { getDb, getStorageClient } from './client';
import {
  CITY_OF_ANGELS_COHORT_ID,
  CITY_OF_ANGELS_PROGRAMME_ID,
  defaultCohortConfig,
  type CohortConfig,
} from './cohort-admin-data';

export type AdminProgrammeStatus = 'draft' | 'active' | 'closed';

export type AdminProgrammeRecord = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  location: string;
  status: AdminProgrammeStatus;
  coverImage: string;
  galleryImages: string[];
  videoUrls: string[];
  kind: 'project';
  parentProgrammeSlug: 'shop' | 'slop';
  showInDirectory: boolean;
  isPublished: boolean;
  sortOrder: number;
};

export type AdminProgrammeListItem = {
  programme: AdminProgrammeRecord;
  cohortCount: number;
};

export type AdminProgrammeDetail = {
  programme: AdminProgrammeRecord;
  cohorts: CohortConfig[];
  usedFirebase: boolean;
};

type FirestoreProgramme = Partial<AdminProgrammeRecord>;

export const defaultCityOfAngelsProgramme: AdminProgrammeRecord = {
  id: CITY_OF_ANGELS_PROGRAMME_ID,
  slug: CITY_OF_ANGELS_PROGRAMME_ID,
  title: 'City of Angels',
  summary: 'A live SHOP project programme with structured cohorts, delivery-slot finance, and guided group formation.',
  description:
    'City of Angels is the current project programme under SHOP. Each cohort under this programme can carry its own group-formation configuration, finance template, and delivery-slot usage.',
  location: 'Airport City',
  status: 'active',
  coverImage: '',
  galleryImages: [],
  videoUrls: [],
  kind: 'project',
  parentProgrammeSlug: 'shop',
  showInDirectory: false,
  isPublished: false,
  sortOrder: 1,
};

function sanitizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || `programme-${Date.now()}`;
}

function normalizeProgramme(id: string, source?: FirestoreProgramme): AdminProgrammeRecord {
  const data = source ?? {};
  const title = data.title?.trim() || defaultCityOfAngelsProgramme.title;

  return {
    id,
    slug: sanitizeSlug(data.slug?.trim() || id),
    title,
    summary: data.summary?.trim() || '',
    description: data.description?.trim() || '',
    location: data.location?.trim() || '',
    status: data.status ?? 'draft',
    coverImage: data.coverImage?.trim() || '',
    galleryImages: Array.isArray(data.galleryImages) ? data.galleryImages.map((item) => String(item)) : [],
    videoUrls: Array.isArray(data.videoUrls) ? data.videoUrls.map((item) => String(item)) : [],
    kind: 'project',
    parentProgrammeSlug: data.parentProgrammeSlug === 'slop' ? 'slop' : 'shop',
    showInDirectory: Boolean(data.showInDirectory),
    isPublished: Boolean(data.isPublished),
    sortOrder: Number(data.sortOrder ?? 0),
  };
}

async function ensureDefaultProgrammeAndCohort() {
  const db = getDb();

  if (!db) {
    return;
  }

  const programmeRef = doc(db, 'programmes', CITY_OF_ANGELS_PROGRAMME_ID);
  const cohortRef = doc(db, 'cohorts', CITY_OF_ANGELS_COHORT_ID);
  const [programmeSnap, cohortSnap] = await Promise.all([getDoc(programmeRef), getDoc(cohortRef)]);

  if (!programmeSnap.exists()) {
    await setDoc(
      programmeRef,
      {
        ...defaultCityOfAngelsProgramme,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  if (!cohortSnap.exists()) {
    await setDoc(
      cohortRef,
      {
        ...defaultCohortConfig,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }
}

export async function getAdminProgrammes(): Promise<{ programmes: AdminProgrammeListItem[]; usedFirebase: boolean }> {
  const db = getDb();

  if (!db) {
    return {
      programmes: [{ programme: defaultCityOfAngelsProgramme, cohortCount: 1 }],
      usedFirebase: false,
    };
  }

  try {
    await ensureDefaultProgrammeAndCohort();

    const [programmeSnap, cohortSnap] = await Promise.all([
      getDocs(query(collection(db, 'programmes'), limit(100))),
      getDocs(query(collection(db, 'cohorts'), limit(200))),
    ]);

    const cohorts = cohortSnap.docs.map((entry) => entry.data() as Partial<CohortConfig>);
    const cohortCounts = new Map<string, number>();

    cohorts.forEach((cohort) => {
      const programmeId = cohort.programmeId ?? CITY_OF_ANGELS_PROGRAMME_ID;
      cohortCounts.set(programmeId, (cohortCounts.get(programmeId) ?? 0) + 1);
    });

    const programmes = programmeSnap.docs
      .filter((entry) => String((entry.data() as Record<string, unknown>).kind ?? '') === 'project')
      .map((entry) => normalizeProgramme(entry.id, entry.data() as FirestoreProgramme))
      .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title))
      .map((programme) => ({
        programme,
        cohortCount: cohortCounts.get(programme.id) ?? 0,
      }));

    return {
      programmes: programmes.length > 0 ? programmes : [{ programme: defaultCityOfAngelsProgramme, cohortCount: 1 }],
      usedFirebase: true,
    };
  } catch {
    return {
      programmes: [{ programme: defaultCityOfAngelsProgramme, cohortCount: 1 }],
      usedFirebase: false,
    };
  }
}

export async function getAdminProgrammeDetail(programmeId: string): Promise<AdminProgrammeDetail> {
  const db = getDb();

  if (!db) {
    return { programme: defaultCityOfAngelsProgramme, cohorts: [defaultCohortConfig], usedFirebase: false };
  }

  try {
    await ensureDefaultProgrammeAndCohort();

    const [programmeSnap, cohortSnap] = await Promise.all([
      getDoc(doc(db, 'programmes', programmeId)),
      getDocs(query(collection(db, 'cohorts'), limit(200))),
    ]);

    const programme = programmeSnap.exists()
      ? normalizeProgramme(programmeSnap.id, programmeSnap.data() as FirestoreProgramme)
      : defaultCityOfAngelsProgramme;
    const cohorts = cohortSnap.docs
      .map((entry) => {
        const data = entry.data() as Partial<CohortConfig>;

        return {
          id: entry.id,
          programmeId: String(data.programmeId ?? programme.id),
          projectName: String(data.projectName ?? programme.title),
          cohortName: String(data.cohortName ?? 'Unnamed Cohort'),
          cohortCode: String(data.cohortCode ?? 'COHORT'),
          status: (data.status ?? 'draft') as CohortConfig['status'],
          description: String(data.description ?? ''),
          location: String(data.location ?? programme.location),
          maxMembersPerGroup: Number(data.maxMembersPerGroup ?? defaultCohortConfig.maxMembersPerGroup),
          allowAutoCreateNextGroup: Boolean(data.allowAutoCreateNextGroup ?? false),
          interestOptions: Array.isArray(data.interestOptions) ? data.interestOptions : defaultCohortConfig.interestOptions,
          paymentYearOptions: Array.isArray(data.paymentYearOptions) ? data.paymentYearOptions : defaultCohortConfig.paymentYearOptions,
        } satisfies CohortConfig;
      })
      .filter((cohort) => cohort.programmeId === programme.id)
      .sort((a, b) => a.cohortCode.localeCompare(b.cohortCode));

    return {
      programme,
      cohorts: cohorts.length > 0 && programme.id !== CITY_OF_ANGELS_PROGRAMME_ID ? cohorts : programme.id === CITY_OF_ANGELS_PROGRAMME_ID && cohorts.length === 0 ? [defaultCohortConfig] : cohorts,
      usedFirebase: true,
    };
  } catch {
    return { programme: defaultCityOfAngelsProgramme, cohorts: [defaultCohortConfig], usedFirebase: false };
  }
}

export async function saveProgramme(input: AdminProgrammeRecord) {
  const db = getDb();

  if (!db) {
    return false;
  }

  const id = sanitizeSlug(input.id || input.slug || input.title);

  await setDoc(
    doc(db, 'programmes', id),
    {
      ...input,
      id,
      slug: sanitizeSlug(input.slug || id),
      title: input.title.trim(),
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );

  return id;
}

export async function createCohortForProgramme(programme: AdminProgrammeRecord, existingCount: number) {
  const nextNumber = existingCount + 1;
  const cohortId = `${programme.id}-cohort-${String(nextNumber).padStart(2, '0')}`;
  const cohortCode = `${programme.title
    .split(/\s+/)
    .map((item) => item[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 3)}-${String(nextNumber).padStart(2, '0')}`;

  const cohort: CohortConfig = {
    ...defaultCohortConfig,
    id: cohortId,
    programmeId: programme.id,
    projectName: programme.title,
    cohortName: `${programme.title} Cohort ${String(nextNumber).padStart(2, '0')}`,
    cohortCode,
    location: programme.location || defaultCohortConfig.location,
    status: 'draft',
  };

  const db = getDb();

  if (!db) {
    return cohort;
  }

  await setDoc(
    doc(db, 'cohorts', cohort.id),
    {
      ...cohort,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );

  return cohort;
}

export async function uploadProgrammeMedia(programmeId: string, file: File, mediaType: 'images' | 'videos') {
  const db = getDb();
  const storage = getStorageClient();

  if (!db || !storage) {
    throw new Error('Firebase storage is not configured in this web workspace.');
  }

  const expectedMimePrefix = mediaType === 'images' ? 'image/' : 'video/';
  const maxBytes = mediaType === 'images' ? 20 * 1024 * 1024 : 80 * 1024 * 1024;

  if (!file.type.startsWith(expectedMimePrefix)) {
    throw new Error(mediaType === 'images' ? 'Select a valid image file.' : 'Select a valid video file.');
  }

  if (file.size > maxBytes) {
    throw new Error(
      mediaType === 'images'
        ? 'Image uploads must be smaller than 20 MB.'
        : 'Video uploads must be smaller than 80 MB.'
    );
  }

  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]+/g, '-')}`;
  const mediaRef = ref(storage, `programmes/${programmeId}/${mediaType}/${safeName}`);

  await uploadBytes(mediaRef, file, {
    contentType: file.type,
    customMetadata: {
      mediaType,
      uploadedFrom: 'grouptown-web-admin',
    },
  });

  const downloadUrl = await getDownloadURL(mediaRef);
  const programmeRef = doc(db, 'programmes', programmeId);
  const programmeSnap = await getDoc(programmeRef);
  const currentCoverImage = programmeSnap.exists()
    ? String((programmeSnap.data() as Partial<AdminProgrammeRecord>).coverImage ?? '').trim()
    : '';

  await setDoc(programmeRef, {
    updatedAt: serverTimestamp(),
    ...(mediaType === 'images'
      ? {
          galleryImages: arrayUnion(downloadUrl),
          coverImage: currentCoverImage || downloadUrl,
        }
      : {
          videoUrls: arrayUnion(downloadUrl),
        }),
  }, { merge: true });

  return downloadUrl;
}
