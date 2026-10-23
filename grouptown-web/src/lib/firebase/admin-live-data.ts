import { collection, getDocs, limit, query, where, type QueryDocumentSnapshot } from 'firebase/firestore';

import { getDb } from './client';

type FirestoreTimestampLike = {
  toDate?: () => Date;
};

type FirestoreRegistration = Partial<{
  userId: string;
  userEmail: string;
  status: 'pending_review' | 'approved' | 'corrections_requested' | 'blocked';
  assignedGroupId: string | null;
  assignedMemberId: string | null;
  preferences: Partial<{
    deliveryTrack: string;
    deliverySlot: string;
  }>;
  applicant: Partial<{
    firstName: string;
    otherNames: string;
    surname: string;
  }>;
  updatedAt: FirestoreTimestampLike;
}>;

type FirestoreGroup = Partial<{
  name: string;
  cohortId: string;
  members: Array<{ id?: string }>;
  status: 'open' | 'full';
}>;

type FirestoreShopUser = Partial<{
  name: string;
  email: string;
  role: string;
  kind: string;
  statusTag: string;
  registrationSubmitted: boolean;
  registrationCompleted: boolean;
  assignedGroupId: string | null;
  updatedAt: FirestoreTimestampLike;
}>;

export type LiveAdminMetric = {
  label: string;
  value: string;
  meta: string;
};

export type LiveAdminMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  statusLabel: string;
  groupLabel: string;
  updatedLabel: string;
};

export type AdminOverviewLiveData = {
  metrics: LiveAdminMetric[];
  recentMembers: LiveAdminMember[];
  usedFirebase: boolean;
};

export type AdminMembersLiveData = {
  members: LiveAdminMember[];
  usedFirebase: boolean;
};

function formatShortDate(value?: FirestoreTimestampLike) {
  const date = value?.toDate?.();

  if (!date) {
    return 'Recent update';
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function toApplicantName(record?: FirestoreRegistration['applicant']) {
  return [record?.firstName, record?.otherNames, record?.surname].filter(Boolean).join(' ').trim();
}

function toMemberStatus(user: FirestoreShopUser, registration?: FirestoreRegistration) {
  if (registration?.status === 'pending_review') {
    return 'Pending review';
  }

  if (registration?.status === 'corrections_requested') {
    return 'Corrections requested';
  }

  if (registration?.status === 'approved' || user.registrationCompleted) {
    return 'Approved';
  }

  if (user.statusTag) {
    return user.statusTag.replace(/_/g, ' ');
  }

  if (user.registrationSubmitted) {
    return 'Registration submitted';
  }

  return 'Account created';
}

function mapLiveMember(
  entry: QueryDocumentSnapshot,
  groupsById: Map<string, string>,
  registrationsByUserId: Map<string, FirestoreRegistration>
): LiveAdminMember {
  const user = entry.data() as FirestoreShopUser;
  const registration = registrationsByUserId.get(entry.id);
  const displayName =
    user.name?.trim() ||
    toApplicantName(registration?.applicant) ||
    user.email?.split('@')[0]?.replace(/[._-]+/g, ' ') ||
    'Unnamed member';
  const assignedGroupId = user.assignedGroupId ?? registration?.assignedGroupId ?? null;

  return {
    id: entry.id,
    name: displayName,
    email: user.email?.trim() || registration?.userEmail?.trim() || 'No email',
    role: user.role?.trim() || 'Registered member',
    statusLabel: toMemberStatus(user, registration),
    groupLabel: assignedGroupId ? groupsById.get(assignedGroupId) ?? assignedGroupId : 'No group assigned',
    updatedLabel: formatShortDate(user.updatedAt ?? registration?.updatedAt),
  };
}

async function loadLiveAdminBase() {
  const db = getDb();

  if (!db) {
    return null;
  }

  const [registrationsSnap, groupsSnap, usersSnap] = await Promise.all([
    getDocs(query(collection(db, 'registrations'), limit(200))),
    getDocs(query(collection(db, 'groups'), limit(200))),
    getDocs(query(collection(db, 'shopUsers'), limit(200))),
  ]);

  const registrations = registrationsSnap.docs.map((entry) => entry.data() as FirestoreRegistration);
  const registrationsByUserId = new Map<string, FirestoreRegistration>();

  registrations.forEach((item, index) => {
    const fallbackId = registrationsSnap.docs[index]?.id;
    const userId = item.userId ?? fallbackId;

    if (userId) {
      registrationsByUserId.set(userId, item);
    }
  });

  const groups = groupsSnap.docs.map((entry) => ({
    id: entry.id,
    ...(entry.data() as FirestoreGroup),
  }));
  const groupsById = new Map<string, string>(
    groups.map((group) => [group.id, group.name?.trim() || group.id])
  );

  const memberDocs = usersSnap.docs.filter((entry) => {
    const data = entry.data() as FirestoreShopUser;
    const role = data.role?.trim().toLowerCase() ?? '';

    if (role === 'admin' || role === 'superadmin') {
      return false;
    }

    return data.kind === 'member' || data.registrationSubmitted || registrationsByUserId.has(entry.id);
  });

  const liveMembers = memberDocs
    .map((entry) => mapLiveMember(entry, groupsById, registrationsByUserId))
    .sort((a, b) => a.name.localeCompare(b.name));

  const pendingApplications = registrations.filter((item) => item.status === 'pending_review').length;
  const approvedMembers = liveMembers.filter((item) => item.statusLabel.toLowerCase() === 'approved').length;
  const openGroups = groups.filter((group) => (group.status ?? 'open') !== 'full').length;
  const takenSlots = new Set(
    registrations
      .map((item) =>
        item.preferences?.deliveryTrack && item.preferences?.deliverySlot
          ? `${item.preferences.deliveryTrack}:${item.preferences.deliverySlot}`
          : null
      )
      .filter((value): value is string => Boolean(value))
  ).size;

  return {
    liveMembers,
    pendingApplications,
    approvedMembers,
    openGroups,
    takenSlots,
  };
}

export async function getAdminOverviewLiveData(): Promise<AdminOverviewLiveData> {
  try {
    const base = await loadLiveAdminBase();

    if (!base) {
      throw new Error('Firebase unavailable');
    }

    return {
      metrics: [
        { label: 'Pending applications', value: String(base.pendingApplications), meta: 'Awaiting admin review' },
        { label: 'Approved members', value: String(base.approvedMembers), meta: 'Live member records' },
        { label: 'Open groups', value: String(base.openGroups), meta: 'Current cohort rollout' },
        { label: 'Taken slots', value: String(base.takenSlots), meta: 'Member-selected delivery slots' },
      ],
      recentMembers: base.liveMembers.slice(0, 6),
      usedFirebase: true,
    };
  } catch {
    return {
      metrics: [
        { label: 'Pending applications', value: '0', meta: 'Fallback mode' },
        { label: 'Approved members', value: '0', meta: 'Fallback mode' },
        { label: 'Open groups', value: '0', meta: 'Fallback mode' },
        { label: 'Taken slots', value: '0', meta: 'Fallback mode' },
      ],
      recentMembers: [],
      usedFirebase: false,
    };
  }
}

export async function getAdminMembersLiveData(): Promise<AdminMembersLiveData> {
  try {
    const base = await loadLiveAdminBase();

    if (!base) {
      throw new Error('Firebase unavailable');
    }

    return {
      members: base.liveMembers,
      usedFirebase: true,
    };
  } catch {
    return { members: [], usedFirebase: false };
  }
}
