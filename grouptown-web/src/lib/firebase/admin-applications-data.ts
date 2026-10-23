import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  where,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';

import { getDb, getFunctionsClient } from './client';
import {
  CITY_OF_ANGELS_COHORT_ID,
  buildCategoriesFromCohort,
  defaultCohortConfig,
  type CohortConfig,
  type GroupCategory,
} from './cohort-admin-data';

type ApplicantRecord = {
  title?: string;
  surname: string;
  firstName: string;
  otherNames: string;
  dateOfBirth: string;
  gender?: string;
  nationality: string;
  idType?: string;
  identificationNumber: string;
};

type ContactEmployerRecord = {
  telephone: string;
  whatsApp: string;
  digitalAddress: string;
  employerName: string;
  jobTitle: string;
};

type RegistrationPreferencesRecord = {
  unitInterest?: string;
  paymentTerm?: string;
  deliveryTrack?: string;
  deliverySlot?: string;
  additionalRequests?: string;
};

type RegistrationState = 'pending_review' | 'approved' | 'corrections_requested' | 'blocked';

type FirestoreRegistration = Partial<{
  programmeId: string;
  cohortId: string;
  cohortName: string;
  categoryKey: string;
  status: RegistrationState;
  userId: string;
  userEmail: string;
  applicant: ApplicantRecord;
  contactEmployer: ContactEmployerRecord;
  preferences: RegistrationPreferencesRecord;
  nextOfKin: Record<string, unknown>;
  assignedGroupId: string | null;
  assignedMemberId: string | null;
  reviewNote: string | null;
}>;

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
  interestOptions: Array<{ value: '2-bedroom' | '3-bedroom'; label: string }>;
  paymentYearOptions: Array<'5 Years' | '10 Years' | '15 Years' | '20 Years' | '25 Years' | '30 Years'>;
}>;

type FirestoreGroup = Partial<{
  name: string;
  cohortId: string;
  cohortName: string;
  projectName: string;
  categoryKey: string;
  cohortNumber: number;
  interest: '2-bedroom' | '3-bedroom';
  interestLabel: string;
  paymentTerm: '5 Years' | '10 Years' | '15 Years' | '20 Years' | '25 Years' | '30 Years';
  maxMembers: number;
  members: Array<{
    id: string;
    name: string;
    initials: string;
    joinedAt: string;
    avatar?: string;
  }>;
  status: 'open' | 'full';
}>;

export type AdminApplicationItem = {
  id: string;
  applicantName: string;
  email: string;
  categoryLabel: string;
  employerLabel: string;
  readinessLabel: string;
  status: RegistrationState;
  assignedGroupId: string | null;
  reviewNote: string | null;
};

export type AdminApplicationsData = {
  applications: AdminApplicationItem[];
  usedFirebase: boolean;
};

export type AdminApplicationDetail = {
  id: string;
  applicantName: string;
  email: string;
  status: RegistrationState;
  categoryLabel: string;
  employerLabel: string;
  phoneLabel: string;
  deliveryLabel: string;
  reviewNote: string | null;
  assignedGroupId: string | null;
};

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
    allowAutoCreateNextGroup: data.allowAutoCreateNextGroup ?? defaultCohortConfig.allowAutoCreateNextGroup,
    interestOptions: data.interestOptions?.length ? data.interestOptions : defaultCohortConfig.interestOptions,
    paymentYearOptions: data.paymentYearOptions?.length ? data.paymentYearOptions : defaultCohortConfig.paymentYearOptions,
  };
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('') || 'GT';
}

function createGroupId(category: GroupCategory, cohortNumber: number) {
  return `${CITY_OF_ANGELS_COHORT_ID}-${category.interest}-${category.paymentTerm.toLowerCase().replace(/\s+/g, '-')}-cohort-${cohortNumber}`;
}

function toApplicantName(applicant?: ApplicantRecord) {
  return [applicant?.firstName, applicant?.otherNames, applicant?.surname].filter(Boolean).join(' ').trim() || 'Unnamed applicant';
}

function toReadinessLabel(record: FirestoreRegistration) {
  const checks = [
    Boolean(record.applicant?.identificationNumber),
    Boolean(record.contactEmployer?.employerName),
    Boolean(record.preferences?.unitInterest),
    Boolean(record.preferences?.paymentTerm),
    Boolean(record.userEmail),
  ];
  const percent = Math.round((checks.filter(Boolean).length / checks.length) * 100);
  return `${percent}% ready`;
}

export async function getPendingApplications(): Promise<AdminApplicationsData> {
  const db = getDb();

  if (!db) {
    return { applications: [], usedFirebase: false };
  }

  try {
    const snap = await getDocs(
      query(collection(db, 'registrations'), where('status', '==', 'pending_review'), limit(50))
    );
    const applications = snap.docs.map((entry) => {
      const data = entry.data() as FirestoreRegistration;
      const applicantName = toApplicantName(data.applicant);

      return {
        id: entry.id,
        applicantName,
        email: data.userEmail?.trim() || 'No email',
        categoryLabel: data.categoryKey?.split('|').slice(1).join(' / ') || 'Category pending',
        employerLabel: data.contactEmployer?.employerName?.trim() || 'Employer pending',
        readinessLabel: toReadinessLabel(data),
        status: data.status ?? 'pending_review',
        assignedGroupId: data.assignedGroupId ?? null,
        reviewNote: data.reviewNote ?? null,
      } satisfies AdminApplicationItem;
    });

    return { applications, usedFirebase: true };
  } catch {
    return { applications: [], usedFirebase: false };
  }
}

export async function getApplicationDetail(registrationId: string): Promise<AdminApplicationDetail | null> {
  const db = getDb();

  if (!db) {
    return null;
  }

  try {
    const snap = await getDoc(doc(db, 'registrations', registrationId));

    if (!snap.exists()) {
      return null;
    }

    const data = snap.data() as FirestoreRegistration;

    return {
      id: snap.id,
      applicantName: toApplicantName(data.applicant),
      email: data.userEmail?.trim() || 'No email',
      status: data.status ?? 'pending_review',
      categoryLabel: data.categoryKey?.split('|').slice(1).join(' / ') || 'Category pending',
      employerLabel: data.contactEmployer?.employerName?.trim() || 'Employer pending',
      phoneLabel: data.contactEmployer?.telephone?.trim() || 'Phone pending',
      deliveryLabel:
        [data.preferences?.deliveryTrack, data.preferences?.deliverySlot].filter(Boolean).join(' / ') || 'Delivery pending',
      reviewNote: data.reviewNote ?? null,
      assignedGroupId: data.assignedGroupId ?? null,
    };
  } catch {
    return null;
  }
}

export async function approveApplicationAndAssign(registrationId: string) {
  const functions = getFunctionsClient();

  if (!functions) {
    return false;
  }

  try {
    const approve = httpsCallable<{ registrationId: string }, { ok?: boolean }>(functions, 'approveApplicationAndAssign');
    const result = await approve({ registrationId });
    return result.data?.ok === true;
  } catch {
    return false;
  }
}

export async function requestApplicationCorrection(registrationId: string) {
  const functions = getFunctionsClient();

  if (!functions) {
    return false;
  }

  try {
    const requestCorrection = httpsCallable<{ registrationId: string }, { ok?: boolean }>(
      functions,
      'requestApplicationCorrection'
    );
    const result = await requestCorrection({ registrationId });
    return result.data?.ok === true;
  } catch {
    return false;
  }
}
