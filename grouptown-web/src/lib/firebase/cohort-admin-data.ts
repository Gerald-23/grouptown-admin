import { collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';

import { getDb, getFunctionsClient } from './client';

export const GROUP_SIZE_OPTIONS = [6, 12, 18, 24, 30, 36] as const;
export const MAX_GROUP_MEMBERS = 36;
export const DEFAULT_GROUP_MEMBERS = 12;
export const CITY_OF_ANGELS_PROGRAMME_ID = 'city-of-angels';
export const CITY_OF_ANGELS_COHORT_ID = 'city-of-angels-cohort-01';

export const defaultInterestOptions = [
  { value: '2-bedroom', label: '2 Bedroom' },
  { value: '3-bedroom', label: '3 Bedroom' },
] as const;

export const defaultPaymentYearOptions = ['5 Years', '10 Years', '15 Years', '20 Years', '25 Years', '30 Years'] as const;

export type UnitInterest = string;
export type PaymentTerm = (typeof defaultPaymentYearOptions)[number];

export type CohortConfig = {
  id: string;
  programmeId: string;
  projectName: string;
  cohortName: string;
  cohortCode: string;
  status: 'draft' | 'active' | 'closed';
  description: string;
  location: string;
  maxMembersPerGroup: number;
  allowAutoCreateNextGroup: boolean;
  interestOptions: ReadonlyArray<{ value: UnitInterest; label: string }>;
  paymentYearOptions: ReadonlyArray<PaymentTerm>;
};

export type GroupCategory = {
  key: string;
  interest: UnitInterest;
  interestLabel: string;
  paymentTerm: PaymentTerm;
  label: string;
};

export type GroupSummary = {
  id: string;
  name: string;
  categoryKey: string;
  cohortNumber: number;
  interestLabel: string;
  paymentTerm: PaymentTerm;
  memberCount: number;
  maxMembers: number;
  status: 'open' | 'full';
};

export type CohortAdminData = {
  cohorts: CohortConfig[];
  activeCohort: CohortConfig;
  categories: GroupCategory[];
  groups: GroupSummary[];
  usedFirebase: boolean;
};

type FirestoreCohort = Partial<{
  programmeId: string;
  projectName: string;
  cohortName: string;
  cohortCode: string;
  status: 'draft' | 'active' | 'closed';
  description: string;
  location: string;
  maxMembersPerGroup: number;
  allowAutoCreateNextGroup: boolean;
  interestOptions: Array<{ value: UnitInterest; label: string }>;
  paymentYearOptions: PaymentTerm[];
}>;

type FirestoreGroup = Partial<{
  name: string;
  categoryKey: string;
  cohortNumber: number;
  interestLabel: string;
  paymentTerm: PaymentTerm;
  maxMembers: number;
  members: unknown[];
  status: 'open' | 'full';
  cohortId: string;
}>;

export const defaultCohortConfig: CohortConfig = {
  id: CITY_OF_ANGELS_COHORT_ID,
  programmeId: CITY_OF_ANGELS_PROGRAMME_ID,
  projectName: 'City of Angels',
  cohortName: 'City of Angels Cohort 01',
  cohortCode: 'COA-01',
  status: 'active',
  description: 'Collaborative ownership model for City of Angels members forming into guided 12-person groups.',
  location: 'Airport City',
  maxMembersPerGroup: DEFAULT_GROUP_MEMBERS,
  allowAutoCreateNextGroup: false,
  interestOptions: defaultInterestOptions,
  paymentYearOptions: defaultPaymentYearOptions,
};

export function buildCategoriesFromCohort(cohort: CohortConfig): GroupCategory[] {
  return cohort.interestOptions.flatMap((interest) =>
    cohort.paymentYearOptions.map((paymentTerm) => ({
      key: `${cohort.id}|${interest.value}|${paymentTerm}`,
      interest: interest.value,
      interestLabel: interest.label,
      paymentTerm,
      label: `${interest.label} - ${paymentTerm}`,
    }))
  );
}

function mapCohort(id: string, data: FirestoreCohort): CohortConfig {
  return {
    id,
    programmeId: data.programmeId?.trim() || defaultCohortConfig.programmeId,
    projectName: data.projectName?.trim() || defaultCohortConfig.projectName,
    cohortName: data.cohortName?.trim() || defaultCohortConfig.cohortName,
    cohortCode: data.cohortCode?.trim() || defaultCohortConfig.cohortCode,
    status: data.status ?? defaultCohortConfig.status,
    description: data.description?.trim() || defaultCohortConfig.description,
    location: data.location?.trim() || defaultCohortConfig.location,
    maxMembersPerGroup: data.maxMembersPerGroup ?? defaultCohortConfig.maxMembersPerGroup,
    allowAutoCreateNextGroup: data.allowAutoCreateNextGroup ?? false,
    interestOptions: (data.interestOptions?.length ? data.interestOptions : defaultCohortConfig.interestOptions) as CohortConfig['interestOptions'],
    paymentYearOptions: (data.paymentYearOptions?.length ? data.paymentYearOptions : defaultCohortConfig.paymentYearOptions) as CohortConfig['paymentYearOptions'],
  };
}

async function ensureDefaultCohort() {
  const db = getDb();

  if (!db) {
    return;
  }

  const cohortRef = doc(db, 'cohorts', CITY_OF_ANGELS_COHORT_ID);
  const cohortSnap = await getDoc(cohortRef);

  if (!cohortSnap.exists()) {
    await setDoc(cohortRef, {
      programmeId: defaultCohortConfig.programmeId,
      projectName: defaultCohortConfig.projectName,
      cohortName: defaultCohortConfig.cohortName,
      cohortCode: defaultCohortConfig.cohortCode,
      status: defaultCohortConfig.status,
      description: defaultCohortConfig.description,
      location: defaultCohortConfig.location,
      maxMembersPerGroup: defaultCohortConfig.maxMembersPerGroup,
      allowAutoCreateNextGroup: defaultCohortConfig.allowAutoCreateNextGroup,
      interestOptions: defaultCohortConfig.interestOptions,
      paymentYearOptions: defaultCohortConfig.paymentYearOptions,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}

function makeFallbackGroups(categories: GroupCategory[]): GroupSummary[] {
  const category = categories.find((item) => item.interest === '3-bedroom' && item.paymentTerm === '20 Years') ?? categories[0]!;

  return [
    {
      id: `${CITY_OF_ANGELS_COHORT_ID}-3-bedroom-20-years-cohort-1`,
      name: 'City of Angels Group',
      categoryKey: category.key,
      cohortNumber: 1,
      interestLabel: category.interestLabel,
      paymentTerm: category.paymentTerm,
      memberCount: 9,
      maxMembers: MAX_GROUP_MEMBERS,
      status: 'open',
    },
  ];
}

export async function getCohortAdminData(activeCohortId?: string): Promise<CohortAdminData> {
  const db = getDb();
  const fallbackCategories = buildCategoriesFromCohort(defaultCohortConfig);
  const targetCohortId = activeCohortId ?? CITY_OF_ANGELS_COHORT_ID;

  if (!db) {
    return {
      cohorts: [defaultCohortConfig],
      activeCohort: defaultCohortConfig,
      categories: fallbackCategories,
      groups: makeFallbackGroups(fallbackCategories),
      usedFirebase: false,
    };
  }

  try {
    await ensureDefaultCohort();

    const [cohortDoc, groupSnap] = await Promise.all([
      getDoc(doc(db, 'cohorts', targetCohortId)),
      getDocs(query(collection(db, 'groups'), where('cohortId', '==', targetCohortId))),
    ]);

    const activeCohort = cohortDoc.exists()
      ? mapCohort(cohortDoc.id, cohortDoc.data() as FirestoreCohort)
      : defaultCohortConfig;
    const cohorts = [activeCohort];

    const categories = buildCategoriesFromCohort(activeCohort);
    const groups = groupSnap.docs
      .map((entry) => {
        const data = entry.data() as FirestoreGroup;

        return {
          id: entry.id,
          name: data.name?.trim() || `${activeCohort.projectName} Group`,
          categoryKey: data.categoryKey?.trim() || '',
          cohortNumber: data.cohortNumber ?? 1,
          interestLabel: data.interestLabel?.trim() || '3 Bedroom',
          paymentTerm: data.paymentTerm ?? '20 Years',
          memberCount: Array.isArray(data.members) ? data.members.length : 0,
          maxMembers: data.maxMembers ?? activeCohort.maxMembersPerGroup,
          status: data.status ?? 'open',
        };
      })
      .sort((a, b) => a.cohortNumber - b.cohortNumber);

    return {
      cohorts,
      activeCohort,
      categories,
      groups: groups.length > 0 ? groups : makeFallbackGroups(categories),
      usedFirebase: true,
    };
  } catch {
    return {
      cohorts: [defaultCohortConfig],
      activeCohort: defaultCohortConfig,
      categories: fallbackCategories,
      groups: makeFallbackGroups(fallbackCategories),
      usedFirebase: false,
    };
  }
}

export async function saveCohortConfig(input: CohortConfig): Promise<void> {
  const functions = getFunctionsClient();

  if (!functions) {
    return;
  }

  const saveCohort = httpsCallable<{ cohort: CohortConfig }, { ok?: boolean }>(functions, 'saveCohortConfig');
  await saveCohort({ cohort: input });
}
