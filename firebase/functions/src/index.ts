import { initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { onDocumentCreated, onDocumentWritten } from 'firebase-functions/v2/firestore';
import { HttpsError, onCall, onRequest } from 'firebase-functions/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { logger } from 'firebase-functions';

initializeApp();

const firestore = getFirestore();
const CITY_OF_ANGELS_PROGRAMME_ID = 'city-of-angels';
const CITY_OF_ANGELS_COHORT_ID = 'city-of-angels-cohort-01';
const GROUP_SIZE_OPTIONS = [6, 12, 18, 24, 30, 36] as const;
const MAX_GROUP_MEMBERS = GROUP_SIZE_OPTIONS[GROUP_SIZE_OPTIONS.length - 1];
const DEFAULT_GROUP_MEMBERS = 12;
const SYSTEM_MESSAGE_AUTHOR_ID = '__system__';
const SYSTEM_MESSAGE_AUTHOR_NAME = 'GroupTown';
const SYSTEM_MESSAGE_AUTHOR_INITIALS = 'GT';

/**
 * Hubtel secrets are intentionally read only from the Functions runtime.
 * Never put these values in the Expo app or a public web bundle.
 */
const HUBTEL_API_ID = process.env.HUBTEL_API_ID?.trim() ?? '';
const HUBTEL_API_KEY = process.env.HUBTEL_API_KEY?.trim() ?? '';
const HUBTEL_MERCHANT_ACCOUNT = process.env.HUBTEL_MERCHANT_ACCOUNT?.trim() ?? '';
const HUBTEL_CHECKOUT_URL = process.env.HUBTEL_CHECKOUT_URL?.trim() || 'https://payproxyapi.hubtel.com/items/initiate';
const HUBTEL_CALLBACK_URL = process.env.HUBTEL_CALLBACK_URL?.trim() ?? '';
const HUBTEL_RETURN_URL = process.env.HUBTEL_RETURN_URL?.trim() ?? '';
const HUBTEL_CANCEL_URL = process.env.HUBTEL_CANCEL_URL?.trim() ?? '';
const HUBTEL_LOGO_URL = process.env.HUBTEL_LOGO_URL?.trim() ?? '';

type UnitInterest = string;
type PaymentTerm = '5 Years' | '10 Years' | '15 Years' | '20 Years' | '25 Years' | '30 Years';
type RegistrationState = 'pending_review' | 'approved' | 'corrections_requested' | 'blocked';
type GroupCreationRequestState = 'pending_review' | 'approved' | 'declined';

function isAtLeast18(dateOfBirth: unknown, today = new Date()) {
  if (typeof dateOfBirth !== 'string') {
    return false;
  }

  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dateOfBirth.trim());
  if (!match) {
    return false;
  }

  const [, dayText, monthText, yearText] = match;
  const day = Number(dayText);
  const month = Number(monthText);
  const year = Number(yearText);
  const birthDate = new Date(year, month - 1, day);
  if (birthDate.getFullYear() !== year || birthDate.getMonth() !== month - 1 || birthDate.getDate() !== day) {
    return false;
  }

  let age = today.getFullYear() - year;
  if (today.getMonth() < month - 1 || (today.getMonth() === month - 1 && today.getDate() < day)) {
    age -= 1;
  }
  return age >= 18;
}

type CohortConfig = {
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
  interestOptions: Array<{ value: UnitInterest; label: string }>;
  paymentYearOptions: PaymentTerm[];
};

type FinanceTemplate = {
  cohortId: string;
  comparisonLabel: string;
  currencySymbol: string;
  contributionGoalLabel: string;
  adminNote: string;
  downPaymentRate: number;
  unitPrices: Record<string, number>;
  paymentGateway?: {
    enabled: boolean;
    mode: 'test';
    currency: 'GHS' | 'USD';
    callbackPath: string;
    publicKeyEnvVar: string;
    defaultCustomerEmail: string;
    defaultChargeType: 'down-payment' | 'full-price' | 'custom';
    defaultUnitInterest: UnitInterest;
    customTestAmount: number;
  };
  deliveryTracks: Array<{
    key: string;
    label: string;
    description: string;
    slots: Array<{
      key: string;
      label: string;
      isAvailable: boolean;
      memberPrice: number;
      initialDeposit: number;
      monthlyContribution: number;
      unitMonthlyContributions?: Record<string, number>;
      targetCompletionMonths: number;
    }>;
  }>;
};

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

type FirestoreDeliverySlotClaim = Partial<{
  cohortId: string;
  unitInterest: string;
  paymentTerm: string;
  deliveryTrack: string;
  deliverySlot: string;
  registrationId: string;
  userId: string | null;
}>;

type FirestoreDeliverySlotAvailability = Partial<{
  cohortId: string;
  unitInterest: string;
  paymentTerm: string;
  deliveryTrack: string;
  deliverySlot: string;
  isAvailable: boolean;
}>;

type FirestoreRegistration = Partial<{
  programmeId: string;
  cohortId: string;
  cohortName: string;
  categoryKey: string | null;
  status: RegistrationState;
  userId: string;
  userEmail: string;
  applicant: ApplicantRecord;
  contactEmployer: ContactEmployerRecord;
  preferences: RegistrationPreferencesRecord;
  assignedGroupId: string | null;
  assignedMemberId: string | null;
  groupMemberships: Array<{ groupId: string; interest: string; paymentTerm: string; status: 'active' | 'completed' | 'cancelled' | 'exited' }>;
  reviewNote: string | null;
}>;

type FirestoreGroup = Partial<{
  name: string;
  cohortId: string;
  cohortName: string;
  projectName: string;
  categoryKey: string;
  cohortNumber: number;
  interest: UnitInterest;
  interestLabel: string;
  paymentTerm: PaymentTerm;
  maxMembers: number;
  members: Array<{
    id: string;
    name: string;
    initials: string;
    joinedAt: string;
    avatar?: string;
  }>;
  status: 'open' | 'full';
  standaloneInterestId: string | null;
}>;

type FirestoreGroupCreationRequest = Partial<{
  userId: string;
  requesterName: string;
  requesterEmail: string;
  cohortId: string;
  cohortName: string;
  categoryKey: string;
  interest: UnitInterest;
  interestLabel: string;
  paymentTerm: PaymentTerm;
  notes: string;
  status: GroupCreationRequestState;
  groupId: string | null;
  reviewNote: string | null;
  maxMembers: number;
  standaloneInterestId: string | null;
}>;

function isValidGroupSize(value: unknown): value is number {
  return typeof value === 'number' && GROUP_SIZE_OPTIONS.includes(value as (typeof GROUP_SIZE_OPTIONS)[number]);
}

function activeMembershipsFor(registration: FirestoreRegistration) {
  const memberships = registration.groupMemberships?.filter((membership) => membership.status === 'active') ?? [];
  if (registration.assignedGroupId && !memberships.some((membership) => membership.groupId === registration.assignedGroupId)) {
    memberships.push({
      groupId: registration.assignedGroupId,
      interest: registration.preferences?.unitInterest ?? '',
      paymentTerm: registration.preferences?.paymentTerm ?? '20 Years',
      status: 'active',
    });
  }
  return memberships;
}

type FirestoreTransaction = Partial<{
  title: string;
  dateLabel: string;
  amountLabel: string;
  amountValue: number;
  status: string;
  kind: 'deposit' | 'monthly' | 'other';
  icon: 'payments' | 'business' | 'schedule';
}>;

const defaultCohortConfig: CohortConfig = {
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
  interestOptions: [
    { value: '2-bedroom', label: '2 Bedroom' },
    { value: '3-bedroom', label: '3 Bedroom' },
  ],
  paymentYearOptions: ['5 Years', '10 Years', '15 Years', '20 Years', '25 Years', '30 Years'],
};

function assertSignedIn(auth?: { uid?: string }) {
  if (!auth?.uid) {
    throw new HttpsError('unauthenticated', 'Sign in is required.');
  }
}

async function assertAdmin(auth?: { uid?: string; token?: { admin?: unknown } & Record<string, unknown> }) {
  assertSignedIn(auth);

  if (auth?.token?.admin === true) {
    return;
  }

  const userSnap = await firestore.doc(`shopUsers/${auth!.uid}`).get();
  const role = userSnap.exists ? userSnap.data()?.role : null;

  if (role !== 'admin' && role !== 'superadmin') {
    throw new HttpsError('permission-denied', 'Admin access is required.');
  }
}

function buildCategoriesFromCohort(cohort: CohortConfig) {
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

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('') || 'GT';
}

function toApplicantName(applicant?: ApplicantRecord) {
  return [applicant?.firstName, applicant?.otherNames, applicant?.surname].filter(Boolean).join(' ').trim() || 'Unnamed applicant';
}

function createGroupId(category: { interest: string; paymentTerm: string }, cohortNumber: number) {
  return `${CITY_OF_ANGELS_COHORT_ID}-${category.interest}-${category.paymentTerm.toLowerCase().replace(/\s+/g, '-')}-cohort-${cohortNumber}`;
}

async function publishGroupSystemMessage(input: {
  groupId: string;
  body: string;
  systemKey: string;
}) {
  const trimmedBody = input.body.trim();

  if (!trimmedBody) {
    return;
  }

  await firestore.collection(`groups/${input.groupId}/messages`).add({
    authorId: SYSTEM_MESSAGE_AUTHOR_ID,
    authorName: SYSTEM_MESSAGE_AUTHOR_NAME,
    authorInitials: SYSTEM_MESSAGE_AUTHOR_INITIALS,
    body: trimmedBody,
    kind: 'system',
    systemKey: input.systemKey,
    mentions: [],
    attachments: [],
    createdAt: FieldValue.serverTimestamp(),
  });
}

function splitDeliverySlotClaimId(claimId: string) {
  const parts = claimId.split('__');

  if (parts.length === 4) {
    const [unitInterest, paymentTerm, deliveryTrack, deliverySlot] = parts;

    if (!unitInterest || !paymentTerm || !deliveryTrack || !deliverySlot) {
      return null;
    }

    return {
      unitInterest,
      paymentTerm,
      deliveryTrack,
      deliverySlot,
    };
  }

  const [deliveryTrack, deliverySlot] = parts;

  if (!deliveryTrack || !deliverySlot) {
    return null;
  }

  return { deliveryTrack, deliverySlot };
}

async function syncDeliverySlotAvailability(
  cohortId: string,
  claimId: string,
  data: FirestoreDeliverySlotClaim | FirestoreDeliverySlotAvailability | undefined,
  isAvailable: boolean
) {
  const slot =
    data?.deliveryTrack && data?.deliverySlot
      ? {
          unitInterest: data.unitInterest,
          paymentTerm: data.paymentTerm,
          deliveryTrack: data.deliveryTrack,
          deliverySlot: data.deliverySlot,
        }
      : splitDeliverySlotClaimId(claimId);

  if (!slot) {
    logger.warn('Unable to sync delivery slot availability for malformed claim', { cohortId, claimId });
    return;
  }

  await firestore.doc(`cohorts/${cohortId}/deliverySlotAvailability/${claimId}`).set(
    {
      cohortId,
      ...(slot.unitInterest ? { unitInterest: slot.unitInterest } : {}),
      ...(slot.paymentTerm ? { paymentTerm: slot.paymentTerm } : {}),
      deliveryTrack: slot.deliveryTrack,
      deliverySlot: slot.deliverySlot,
      isAvailable,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
}

async function notifyUser(userId: string, input: { title: string; body: string; route: string; kind: 'announcement' | 'payment' | 'message' | 'support' | 'system' }) {
  const notificationRef = firestore.collection(`shopUsers/${userId}/notifications`).doc();

  await notificationRef.set({
    title: input.title,
    body: input.body,
    route: input.route,
    kind: input.kind,
    read: false,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return notificationRef.id;
}

async function notifyUserWithId(
  userId: string,
  notificationId: string,
  input: { title: string; body: string; route: string; kind: 'announcement' | 'payment' | 'message' | 'support' | 'system' }
) {
  const notificationRef = firestore.doc(`shopUsers/${userId}/notifications/${notificationId}`);

  await notificationRef.set(
    {
      title: input.title,
      body: input.body,
      route: input.route,
      kind: input.kind,
      read: false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return notificationRef.id;
}

type PushPreferenceKey =
  | 'announcementAlerts'
  | 'paymentReminders'
  | 'groupMessageAlerts'
  | 'communityAlerts'
  | 'supportAlerts';

async function sendExpoPush(
  userId: string,
  preferenceKey: PushPreferenceKey,
  payload: {
    title: string;
    body: string;
    route?: string | null;
    notificationId: string;
  }
) {
  const settingsSnap = await firestore.doc(`shopUsers/${userId}/settings/preferences`).get();
  const settings = settingsSnap.exists ? settingsSnap.data() : null;

  if (settings?.pushEnabled === false || settings?.[preferenceKey] === false) {
    return;
  }

  const deviceSnap = await firestore.doc(`shopUsers/${userId}/devices/expo`).get();
  const expoPushToken = deviceSnap.exists ? deviceSnap.data()?.expoPushToken : null;

  if (typeof expoPushToken !== 'string' || expoPushToken.length === 0) {
    return;
  }

  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      to: expoPushToken,
      title: payload.title,
      body: payload.body,
      sound: 'default',
      data: {
        route: payload.route ?? '/notifications',
        notificationId: payload.notificationId,
      },
    }),
  });

  if (!response.ok) {
    logger.error('Expo push send failed', { userId, status: response.status });
  }
}

function isPaymentReminderCandidate(transaction: FirestoreTransaction) {
  const kind = transaction.kind ?? 'other';
  const status = transaction.status?.trim().toLowerCase() ?? '';

  if (kind !== 'deposit' && kind !== 'monthly') {
    return false;
  }

  return !['completed', 'paid', 'cancelled', 'canceled', 'failed', 'refunded'].includes(status);
}

function buildPaymentReminderMessage(transaction: FirestoreTransaction) {
  const title = transaction.title?.trim() || 'Payment reminder';
  const amount = transaction.amountLabel?.trim();
  const dateLabel = transaction.dateLabel?.trim();

  const bodyParts = [
    amount ? `${amount} is pending` : 'A contribution is pending',
    dateLabel ? `for ${dateLabel}` : null,
  ].filter(Boolean);

  return {
    title,
    body: bodyParts.join(' ') + '. Open Finance to review the next payment.',
  };
}

export const healthcheck = onRequest((_request, response) => {
  response.status(200).json({ ok: true, service: 'grouptown-functions' });
});

type HubtelCallback = {
  responseCode?: unknown;
  ResponseCode?: unknown;
  data?: {
    paymentType?: unknown;
    status?: unknown;
    amount?: unknown;
    paylinkId?: unknown;
    phoneNumber?: unknown;
    clientReference?: unknown;
  };
  Data?: {
    paymentType?: unknown;
    status?: unknown;
    amount?: unknown;
    paylinkId?: unknown;
    phoneNumber?: unknown;
    clientReference?: unknown;
  };
};

function hubtelConfigurationError() {
  return !HUBTEL_API_ID || !HUBTEL_API_KEY || !HUBTEL_MERCHANT_ACCOUNT || !HUBTEL_CALLBACK_URL || !HUBTEL_RETURN_URL;
}

function normalisePaymentStatus(value: unknown) {
  const status = String(value ?? '').trim().toLowerCase();
  if (['00', '000', '0000', 'success', 'successful', 'paid', 'completed', 'approved'].includes(status)) return 'Completed';
  if (['cancelled', 'canceled'].includes(status)) return 'Canceled';
  if (['failed', 'failure', 'rejected', 'expired'].includes(status)) return 'Failed';
  return 'Pending';
}

export const createHubtelCheckout = onCall(async (request) => {
  if (!request.auth?.uid) {
    throw new HttpsError('unauthenticated', 'Sign in before starting a payment.');
  }
  if (hubtelConfigurationError()) {
    throw new HttpsError('failed-precondition', 'Hubtel is not configured yet. Add the Hubtel runtime values before taking payments.');
  }
  const amount = Number(request.data?.amount);
  if (!Number.isFinite(amount) || amount <= 0 || amount > 30000) {
    throw new HttpsError('invalid-argument', 'Payment amount must be between GHS 0.01 and GHS 30,000.');
  }

  // The app may request a flexible amount, but the server remains the source
  // of truth for the member's outstanding balance. This prevents a modified
  // client from paying above the selected home price.
  const [registrationSnap, financeTemplateSnap, completedTransactionsSnap] = await Promise.all([
    firestore.doc(`registrations/${request.auth.uid}`).get(),
    firestore.doc(`financeTemplates/${CITY_OF_ANGELS_COHORT_ID}`).get(),
    firestore.collection(`shopUsers/${request.auth.uid}/transactions`).where('status', '==', 'Completed').get(),
  ]);
  if (!registrationSnap.exists || !financeTemplateSnap.exists) {
    throw new HttpsError('failed-precondition', 'Complete your registration and select a home before making a payment.');
  }
  const registration = registrationSnap.data() as FirestoreRegistration;
  const financeTemplate = financeTemplateSnap.data() as FinanceTemplate;
  const selectedUnitInterest = registration.preferences?.unitInterest;
  const selectedHomePrice = selectedUnitInterest ? Number(financeTemplate.unitPrices?.[selectedUnitInterest]) : 0;
  if (!Number.isFinite(selectedHomePrice) || selectedHomePrice <= 0) {
    throw new HttpsError('failed-precondition', 'Your selected home price is not available yet.');
  }
  const completedAmount = completedTransactionsSnap.docs.reduce((sum, transaction) => {
    const value = Number(transaction.data().amountValue);
    return Number.isFinite(value) && value > 0 ? sum + value : sum;
  }, 0);
  const remainingBalance = Math.max(Math.round((selectedHomePrice - completedAmount) * 100) / 100, 0);
  if (remainingBalance <= 0) {
    throw new HttpsError('failed-precondition', 'Your contribution goal has already been completed.');
  }
  if (amount > remainingBalance) {
    throw new HttpsError('invalid-argument', `Payment cannot exceed your remaining balance of GHS ${remainingBalance.toFixed(2)}.`);
  }

  // Keep the Hubtel reference short (Hubtel integrations commonly enforce a
  // 32-character limit) while retaining enough entropy for uniqueness.
  const clientReference = `GT-${Date.now().toString(36)}-${request.auth.uid.slice(-6)}-${Math.random().toString(36).slice(2, 8)}`;
  const transactionId = `hubtel-${clientReference.toLowerCase()}`;
  const transactionRef = firestore.doc(`shopUsers/${request.auth.uid}/transactions/${transactionId}`);
  const paymentRef = firestore.doc(`hubtelPayments/${clientReference}`);
  const title = typeof request.data?.title === 'string' && request.data.title.trim() ? request.data.title.trim() : 'GroupTown contribution';
  const description = typeof request.data?.description === 'string' && request.data.description.trim() ? request.data.description.trim() : 'GroupTown member contribution';
  const now = FieldValue.serverTimestamp();

  await firestore.runTransaction(async (transaction) => {
    transaction.set(paymentRef, { clientReference, userId: request.auth!.uid, amount, currency: 'GHS', status: 'Pending', transactionId, createdAt: now, updatedAt: now });
    transaction.set(transactionRef, { title, dateLabel: new Date().toLocaleDateString('en-GH'), amountLabel: `GHS ${amount.toFixed(2)}`, amountValue: amount, status: 'Pending', kind: 'hubtel', icon: 'payments', clientReference, createdAt: now, updatedAt: now });
  });

  const payload = {
    totalAmount: Number(amount.toFixed(2)),
    description: `${title}: ${description}`,
    clientReference,
    merchantAccountNumber: HUBTEL_MERCHANT_ACCOUNT,
    callbackUrl: HUBTEL_CALLBACK_URL,
    cancellationUrl: HUBTEL_CANCEL_URL || HUBTEL_RETURN_URL,
    returnUrl: HUBTEL_RETURN_URL,
    ...(HUBTEL_LOGO_URL ? { logo: HUBTEL_LOGO_URL } : {}),
  };
  const checkoutEndpoint = HUBTEL_CHECKOUT_URL.replace('{merchantAccount}', encodeURIComponent(HUBTEL_MERCHANT_ACCOUNT));
  const hubtelResponse = await fetch(checkoutEndpoint, {
    method: 'POST',
    headers: { Authorization: `Basic ${Buffer.from(`${HUBTEL_API_ID}:${HUBTEL_API_KEY}`).toString('base64')}`, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await hubtelResponse.json().catch(() => ({})) as {
    data?: { paylinkUrl?: unknown; checkoutUrl?: unknown; PaylinkUrl?: unknown; CheckoutUrl?: unknown };
    Data?: { paylinkUrl?: unknown; checkoutUrl?: unknown; PaylinkUrl?: unknown; CheckoutUrl?: unknown };
    message?: unknown;
    Message?: unknown;
    ResponseMessage?: unknown;
    responseCode?: unknown;
    ResponseCode?: unknown;
  };
  const hubtelMessage = String(body.message ?? body.Message ?? body.ResponseMessage ?? '').trim();
  const hubtelResponseCode = String(body.responseCode ?? body.ResponseCode ?? '').trim().toLowerCase();
  const responseRejected = Boolean(hubtelResponseCode) && !['00', '000', '0000', 'success', 'successful'].includes(hubtelResponseCode);
  if (!hubtelResponse.ok || responseRejected) {
    const failureMessage = hubtelMessage || `Hubtel returned ${hubtelResponse.status}${hubtelResponseCode ? ` (${hubtelResponseCode})` : ''}`;
    console.error('Hubtel checkout rejected', {
      httpStatus: hubtelResponse.status,
      responseCode: body.responseCode ?? body.ResponseCode ?? null,
      message: hubtelMessage || null,
    });
    await paymentRef.set({ status: 'Failed', error: failureMessage, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    await transactionRef.set({ status: 'Failed', updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    throw new HttpsError('internal', `Hubtel could not create the payment link: ${failureMessage}`);
  }
  const responseData = body.data ?? body.Data ?? {};
  const checkoutUrl = String(responseData.paylinkUrl ?? responseData.checkoutUrl ?? responseData.PaylinkUrl ?? responseData.CheckoutUrl ?? '').trim();
  if (!checkoutUrl) throw new HttpsError('internal', 'Hubtel returned no checkout URL.');
  await paymentRef.set({ checkoutUrl, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  return { ok: true, clientReference, checkoutUrl };
});

export const cancelHubtelPayment = onCall(async (request) => {
  const userId = request.auth?.uid;
  const clientReference = typeof request.data?.clientReference === 'string'
    ? request.data.clientReference.trim()
    : '';

  if (!userId) throw new HttpsError('unauthenticated', 'Sign in before canceling a payment.');
  if (!clientReference || clientReference.length > 64) {
    throw new HttpsError('invalid-argument', 'A valid payment reference is required.');
  }

  const paymentRef = firestore.doc(`hubtelPayments/${clientReference}`);
  const paymentSnap = await paymentRef.get();
  if (!paymentSnap.exists) throw new HttpsError('not-found', 'This payment could not be found.');

  const payment = paymentSnap.data() ?? {};
  if (String(payment.userId ?? '') !== userId) {
    throw new HttpsError('permission-denied', 'You can only cancel your own payment.');
  }
  if (String(payment.status ?? '') !== 'Pending') {
    return { ok: true, status: String(payment.status ?? 'Pending') };
  }

  const update = {
    status: 'Canceled',
    cancellationReason: 'user_requested',
    updatedAt: FieldValue.serverTimestamp(),
  };
  await paymentRef.set(update, { merge: true });
  if (payment.transactionId) {
    await firestore.doc(`shopUsers/${userId}/transactions/${payment.transactionId}`).set(update, { merge: true });
  }
  return { ok: true, status: 'Canceled' };
});

export const expireHubtelPayments = onSchedule(
  { schedule: 'every 5 minutes', timeZone: 'Africa/Accra', region: 'us-central1' },
  async () => {
    const cutoff = Date.now() - 10 * 60 * 1000;
    const pendingSnap = await firestore.collection('hubtelPayments').where('status', '==', 'Pending').get();
    const batch = firestore.batch();
    let updates = 0;

    for (const paymentDoc of pendingSnap.docs) {
      const payment = paymentDoc.data();
      const createdAt = payment.createdAt as { toMillis?: () => number } | undefined;
      if (!createdAt?.toMillis || createdAt.toMillis() > cutoff) continue;

      const update = {
        status: 'Failed',
        failureReason: 'checkout_timeout',
        updatedAt: FieldValue.serverTimestamp(),
      };
      batch.set(paymentDoc.ref, update, { merge: true });
      if (payment.userId && payment.transactionId) {
        batch.set(firestore.doc(`shopUsers/${payment.userId}/transactions/${payment.transactionId}`), update, { merge: true });
      }
      updates += 1;
    }

    if (updates > 0) await batch.commit();
  }
);

export const hubtelPaymentWebhook = onRequest(async (request, response) => {
  if (request.method !== 'POST') { response.status(405).send('POST required'); return; }
  const callback = (request.body ?? {}) as HubtelCallback;
  const callbackData = callback.data ?? callback.Data ?? {};
  const responseCode = callback.responseCode ?? callback.ResponseCode;
  const clientReference = String(callbackData.clientReference ?? '').trim();
  if (!clientReference) { response.status(400).json({ ok: false, error: 'clientReference is required' }); return; }
  const paymentRef = firestore.doc(`hubtelPayments/${clientReference}`);
  const paymentSnap = await paymentRef.get();
  if (!paymentSnap.exists) { response.status(404).json({ ok: false, error: 'Unknown clientReference' }); return; }
  const payment = paymentSnap.data() ?? {};
  if (payment.status === 'Canceled' || payment.status === 'Failed') {
    response.status(200).json({ ok: true, ignored: true, reason: 'payment_closed' });
    return;
  }
  const callbackAmount = Number(callbackData.amount);
  const expectedAmount = Number(payment.amount);
  if (Number.isFinite(callbackAmount) && Number.isFinite(expectedAmount) && Math.abs(callbackAmount - expectedAmount) > 0.01) {
    response.status(400).json({ ok: false, error: 'Callback amount does not match the payment.' });
    return;
  }
  const status = normalisePaymentStatus(callbackData.status ?? responseCode);
  const finalStatus = payment.status === 'Completed' ? 'Completed' : status;
  const update = { status: finalStatus, hubtelStatus: String(callbackData.status ?? responseCode ?? ''), hubtelPaymentType: String(callbackData.paymentType ?? ''), hubtelPaylinkId: String(callbackData.paylinkId ?? ''), hubtelPhoneNumber: String(callbackData.phoneNumber ?? ''), updatedAt: FieldValue.serverTimestamp() };
  await paymentRef.set(update, { merge: true });
  const userId = String(payment.userId ?? '');
  const transactionId = String(payment.transactionId ?? '');
  if (userId && transactionId) await firestore.doc(`shopUsers/${userId}/transactions/${transactionId}`).set(update, { merge: true });
  response.status(200).json({ ok: true });
});

export const saveCohortConfig = onCall(async (request) => {
  await assertAdmin(request.auth);

  const input = request.data?.cohort as CohortConfig | undefined;

  if (!input?.id || !input.projectName || !input.cohortName) {
    throw new HttpsError('invalid-argument', 'A valid cohort payload is required.');
  }
  if (!isValidGroupSize(input.maxMembersPerGroup)) {
    throw new HttpsError('invalid-argument', 'Group size must be 6, 12, 18, 24, 30, or 36.');
  }

  await firestore.doc(`cohorts/${input.id}`).set(
    {
      programmeId: input.programmeId,
      projectName: input.projectName,
      cohortName: input.cohortName,
      cohortCode: input.cohortCode,
      status: input.status,
      description: input.description,
      location: input.location,
      maxMembersPerGroup: input.maxMembersPerGroup,
      allowAutoCreateNextGroup: input.allowAutoCreateNextGroup,
      interestOptions: input.interestOptions,
      paymentYearOptions: input.paymentYearOptions,
      updatedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return { ok: true };
});

export const saveFinanceTemplate = onCall(async (request) => {
  await assertAdmin(request.auth);

  const template = request.data?.template as FinanceTemplate | undefined;

  if (
    !template?.cohortId ||
    !Array.isArray(template.deliveryTracks) ||
    !template.unitPrices ||
    !Object.values(template.unitPrices).some((price) => Number.isFinite(price) && price > 0) ||
    !Number.isFinite(template.downPaymentRate) ||
    template.downPaymentRate < 0 ||
    template.downPaymentRate > 100
  ) {
    throw new HttpsError(
      'invalid-argument',
      'Set at least one valid interest cash price and a down-payment rate before saving.'
    );
  }

  await firestore.doc(`financeTemplates/${template.cohortId}`).set(
    {
      ...template,
      updatedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return { ok: true };
});

type ShopInterestDraft = {
  id: string;
  programmeId?: string | null;
  label: string;
  description?: string;
  imageUrl?: string;
  price?: number | null;
  monthlyPayment?: number | null;
  paymentTerm?: string;
  paymentTerms?: string[];
  groupSizeOptions?: number[];
};

type LaunchShopInterestInput = ShopInterestDraft & {
  cohortId: string;
  maxMembers: number;
  price: number;
  downPaymentRate: number;
  paymentTerms: PaymentTerm[];
};

function normalizeInterestId(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// A public interest is always launched into a live cohort. Drafts are admin-only
// catalogue records and never leave members with an unavailable Join/Create action.
export const launchShopInterest = onCall(async (request) => {
  await assertAdmin(request.auth);

  const input = request.data?.interest as LaunchShopInterestInput | undefined;
  if (!input) {
    throw new HttpsError('invalid-argument', 'A launch payload is required.');
  }
  const id = input?.id ? normalizeInterestId(input.id) : '';
  const label = input?.label?.trim() ?? '';
  const cohortId = input?.cohortId?.trim() ?? '';
  const terms = Array.isArray(input?.paymentTerms) ? input.paymentTerms.filter((term): term is PaymentTerm => typeof term === 'string') : [];

  if (!id || !label || !cohortId || !Number.isInteger(input?.maxMembers) || input.maxMembers < 2 || !Number.isFinite(input?.price) || input.price <= 0 || !Number.isFinite(input?.downPaymentRate) || input.downPaymentRate < 0 || input.downPaymentRate > 100 || terms.length === 0) {
    throw new HttpsError('invalid-argument', 'A launch needs an interest name, active cohort, group size, price, down-payment rate, and payment terms.');
  }

  if (cohortId !== CITY_OF_ANGELS_COHORT_ID) {
    throw new HttpsError('failed-precondition', 'Member launch currently supports the live City of Angels cohort only.');
  }

  const cohortRef = firestore.doc(`cohorts/${cohortId}`);
  const interestRef = firestore.doc(`shopInterests/${id}`);
  const financeRef = firestore.doc(`financeTemplates/${cohortId}`);

  await firestore.runTransaction(async (transaction) => {
    const [cohortSnap, financeSnap] = await Promise.all([transaction.get(cohortRef), transaction.get(financeRef)]);
    if (!cohortSnap.exists || cohortSnap.data()?.status !== 'active') {
      throw new HttpsError('failed-precondition', 'Select an active cohort before launching this interest.');
    }

    const cohort = cohortSnap.data() as CohortConfig;
    const interestOptions = cohort.interestOptions.some((option) => option.value === id)
      ? cohort.interestOptions.map((option) => option.value === id ? { value: id, label } : option)
      : [...cohort.interestOptions, { value: id, label }];
    const paymentYearOptions = [...new Set([...cohort.paymentYearOptions, ...terms])];
    const existingFinance = financeSnap.exists ? (financeSnap.data() as Partial<FinanceTemplate>) : {};

    transaction.set(interestRef, {
      programmeId: input.programmeId,
      label,
      description: input.description?.trim() ?? '',
      imageUrl: input.imageUrl?.trim() ?? '',
      status: 'published',
      cohortId,
      maxMembers: input.maxMembers,
      price: input.price,
      downPaymentRate: input.downPaymentRate,
      paymentTerms: terms,
      updatedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    transaction.set(firestore.doc(`communityPosts/interest-awareness-${id}`), {
      authorId: 'grouptown-system',
      authorName: 'GroupTown',
      authorInitials: 'GT',
      body: `New interest available: ${label}. Open the Interest catalogue to review the home, payment terms, and group options.`,
      postType: 'interest_awareness',
      interestId: id,
      interestLabel: label,
      interestImageUrl: input.imageUrl?.trim() ?? '',
      createdAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    transaction.set(cohortRef, {
      interestOptions,
      paymentYearOptions,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    transaction.set(financeRef, {
      ...existingFinance,
      cohortId,
      unitPrices: { ...(existingFinance.unitPrices ?? {}), [id]: input.price },
      downPaymentRate: input.downPaymentRate,
      updatedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
    }, { merge: true });
  });

  // Waiting interest is demand for homes not currently listed. Once an admin launches
  // a matching interest, keep the request as history and tell its owner it is actionable.
  const waitingRequests = await firestore
    .collection('waitingInterestRequests')
    .where('programmeId', '==', input.programmeId)
    .get();
  const matchingRequests = waitingRequests.docs.filter((waitingRequest) => {
    const requestedHome = waitingRequest.data().requestedHome;
    return typeof requestedHome === 'string' && normalizeInterestId(requestedHome) === id;
  });

  await Promise.all(
    matchingRequests.map(async (waitingRequest) => {
      const userId = waitingRequest.data().userId;
      await waitingRequest.ref.set(
        {
          status: 'offer_launched',
          interestId: id,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      if (typeof userId !== 'string' || userId.length === 0) {
        return;
      }

      const notificationId = await notifyUser(userId, {
        title: `${label} is now available`,
        body: 'The home you requested is live. You can now join an open group or create one.',
        route: `/property/${id}`,
        kind: 'announcement',
      });
      await sendExpoPush(userId, 'announcementAlerts', {
        title: `${label} is now available`,
        body: 'Open GroupTown to join an open group or create one.',
        route: `/property/${id}`,
        notificationId,
      });
    })
  );

  return { ok: true, interestId: id };
});

export const publishGlobalShopInterest = onCall(async (request) => {
  await assertAdmin(request.auth);
  const input = request.data?.interest as Partial<ShopInterestDraft> | undefined;
  const id = typeof input?.id === 'string' ? normalizeInterestId(input.id) : '';
  const label = typeof input?.label === 'string' ? input.label.trim() : '';
  if (!id || !label) throw new HttpsError('invalid-argument', 'An interest name is required.');
  const description = typeof input?.description === 'string' ? input.description.trim() : '';
  const imageUrl = typeof input?.imageUrl === 'string' ? input.imageUrl.trim() : '';
  const price = typeof input?.price === 'number' && Number.isFinite(input.price) && input.price > 0 ? input.price : null;
  const monthlyPayment = typeof input?.monthlyPayment === 'number' && Number.isFinite(input.monthlyPayment) && input.monthlyPayment > 0 ? input.monthlyPayment : null;
  const paymentTerm = typeof input?.paymentTerm === 'string' ? input.paymentTerm.trim() : '';
  const allowedPaymentTerms = ['5 Years', '10 Years', '15 Years', '20 Years', '25 Years', '30 Years'] as const;
  const paymentTerms = Array.isArray(input?.paymentTerms)
    ? input.paymentTerms.filter((term): term is (typeof allowedPaymentTerms)[number] => typeof term === 'string' && allowedPaymentTerms.includes(term as (typeof allowedPaymentTerms)[number]))
    : paymentTerm && allowedPaymentTerms.includes(paymentTerm as (typeof allowedPaymentTerms)[number]) ? [paymentTerm as (typeof allowedPaymentTerms)[number]] : [];
  const groupSizeOptions = Array.isArray(input?.groupSizeOptions)
    ? [...new Set(input.groupSizeOptions.filter((size): size is number => typeof size === 'number' && [6, 12, 18, 24, 36].includes(size)))]
    : [];
  if (!paymentTerms.length || !groupSizeOptions.length) {
    throw new HttpsError('invalid-argument', 'Choose at least one payment term and one allowed group size.');
  }
  const interestRef = firestore.doc(`shopInterests/${id}`);
  const existing = await interestRef.get();
  await interestRef.set({
    programmeId: null,
    label,
    description,
    imageUrl,
    status: 'published',
    cohortId: null,
    maxMembers: groupSizeOptions[0],
    price,
    monthlyPayment,
    paymentTerm: paymentTerms[0],
    paymentTerms,
    groupSizeOptions,
    updatedAt: FieldValue.serverTimestamp(),
    createdAt: existing.exists ? existing.data()?.createdAt ?? FieldValue.serverTimestamp() : FieldValue.serverTimestamp(),
  }, { merge: true });
  await firestore.doc(`communityPosts/interest-awareness-${id}`).set({
    authorId: 'grouptown-system',
    authorName: 'GroupTown',
    authorInitials: 'GT',
    body: `New interest available: ${label}. Open the Interest catalogue to review the home, payment terms, and group options.`,
    postType: 'interest_awareness',
    interestId: id,
    interestLabel: label,
    interestImageUrl: imageUrl,
    createdAt: FieldValue.serverTimestamp(),
  }, { merge: true });
  const waitingRequests = await firestore.collection('waitingInterestRequests').where('programmeId', '==', null).get();
  const matchingRequests = waitingRequests.docs.filter((waitingRequest) => normalizeInterestId(String(waitingRequest.data().requestedHome ?? '')) === id);
  await Promise.all(matchingRequests.map(async (waitingRequest) => {
    const userId = waitingRequest.data().userId;
    await waitingRequest.ref.set({ status: 'offer_launched', interestId: id, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    if (typeof userId !== 'string' || !userId) return;
    const notificationId = await notifyUser(userId, {
      title: `${label} is now available`,
      body: 'The interest you requested is now listed in GroupTown.',
      route: `/property/${id}`,
      kind: 'announcement',
    });
    await sendExpoPush(userId, 'announcementAlerts', {
      title: `${label} is now available`,
      body: 'Open GroupTown to review the new interest.',
      route: `/property/${id}`,
      notificationId,
    });
  }));
  return { ok: true };
});

export const approveApplicationAndAssign = onCall(async (request) => {
  await assertAdmin(request.auth);

  const registrationId = request.data?.registrationId as string | undefined;

  if (!registrationId) {
    throw new HttpsError('invalid-argument', 'registrationId is required.');
  }

  const registrationRef = firestore.doc(`registrations/${registrationId}`);
  const registrationSnap = await registrationRef.get();

  if (!registrationSnap.exists) {
    throw new HttpsError('not-found', 'Registration not found.');
  }

  const registration = registrationSnap.data() as FirestoreRegistration;

  if (!registration.userId) {
    throw new HttpsError('failed-precondition', 'Registration is missing user details.');
  }

  // Registration approval is deliberately separate from group membership. Members choose
  // an open group or submit a group-creation request after their details are verified.
  await Promise.all([
    registrationRef.set(
      {
        status: 'approved',
        assignedGroupId: null,
        assignedMemberId: null,
        reviewNote: 'Registration approved. Choose an open group or create a new one.',
        reviewedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    ),
    firestore.doc(`shopUsers/${registration.userId}`).set(
      {
        registrationSubmitted: true,
        registrationCompleted: true,
        assignedGroupId: null,
        assignedMemberId: null,
        statusTag: 'approved',
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    ),
  ]);

  const notificationId = await notifyUser(registration.userId, {
    title: 'Application approved',
    body: 'Your registration is approved. You can now join an open group or create one.',
    route: '/group/create',
    kind: 'system',
  });

  await sendExpoPush(registration.userId, 'announcementAlerts', {
    title: 'Application approved',
    body: 'Your registration is approved. You can now join an open group or create one.',
    route: '/group/create',
    notificationId,
  });

  return { ok: true };
});

export const requestGroupCreation = onCall(async (request) => {
  assertSignedIn(request.auth);

  const categoryKey = typeof request.data?.categoryKey === 'string' ? request.data.categoryKey.trim() : '';
  const notes = typeof request.data?.notes === 'string' ? request.data.notes.trim().slice(0, 1_000) : '';
  const maxMembers = request.data?.maxMembers;
  const standaloneInterestId = typeof request.data?.standaloneInterestId === 'string' ? request.data.standaloneInterestId.trim() : '';

  if (!categoryKey) {
    throw new HttpsError('invalid-argument', 'categoryKey is required.');
  }
  if (!isValidGroupSize(maxMembers)) {
    throw new HttpsError('invalid-argument', 'Choose a group size of 6, 12, 18, 24, 30, or 36 members.');
  }

  const registrationRef = firestore.doc(`registrations/${request.auth!.uid}`);
  const registrationSnap = await registrationRef.get();

  if (!registrationSnap.exists) {
    throw new HttpsError('failed-precondition', 'Complete registration before creating a group.');
  }

  const registration = registrationSnap.data() as FirestoreRegistration;

  if (registration.status !== 'approved') {
    throw new HttpsError('failed-precondition', 'Your registration must be approved before creating a group.');
  }

  const activeMemberships = activeMembershipsFor(registration);

  const cohortId = registration.cohortId ?? CITY_OF_ANGELS_COHORT_ID;
  const cohortRef = firestore.doc(`cohorts/${cohortId}`);
  const cohortSnap = await cohortRef.get();
  const cohort = cohortSnap.exists
    ? ({ ...defaultCohortConfig, ...cohortSnap.data(), id: cohortSnap.id } as CohortConfig)
    : defaultCohortConfig;
  let category = buildCategoriesFromCohort(cohort).find((item) => item.key === categoryKey);
  if (standaloneInterestId) {
    const standaloneSnap = await firestore.doc(`shopInterests/${standaloneInterestId}`).get();
    const standalone = standaloneSnap.exists ? standaloneSnap.data() as { status?: string; label?: string; paymentTerm?: string; paymentTerms?: string[]; groupSizeOptions?: number[]; programmeId?: string | null; cohortId?: string | null } : null;
    if (standalone?.status === 'published' && !standalone.programmeId && !standalone.cohortId && categoryKey.startsWith(`standalone:${standaloneInterestId}|`)) {
      const requestedTerm = categoryKey.split('|')[1] ?? '';
      const terms = Array.isArray(standalone.paymentTerms) && standalone.paymentTerms.length ? standalone.paymentTerms : standalone.paymentTerm ? [standalone.paymentTerm] : ['20 Years'];
      const paymentTerm = terms.includes(requestedTerm) ? requestedTerm as PaymentTerm : null;
      const sizes = Array.isArray(standalone.groupSizeOptions) && standalone.groupSizeOptions.length ? standalone.groupSizeOptions : [12];
      if (!paymentTerm || !sizes.includes(maxMembers as number)) throw new HttpsError('invalid-argument', 'Choose an available payment term and group size for this standalone interest.');
      category = { key: categoryKey, interest: standaloneInterestId, interestLabel: standalone.label?.trim() || standaloneInterestId, paymentTerm, label: `${standalone.label?.trim() || standaloneInterestId} - ${paymentTerm}` };
    }
  }

  if (!category || (!standaloneInterestId && cohort.status !== 'active')) {
    throw new HttpsError('failed-precondition', 'That group category is not currently available.');
  }

  if (activeMemberships.some((membership) => membership.interest === category.interest)) {
    throw new HttpsError('failed-precondition', 'You already have an active group for this home interest.');
  }

  const requestRef = firestore.doc(`groupCreationRequests/${request.auth!.uid}__${categoryKey}`);
  const existingRequest = await requestRef.get();

  if (existingRequest.exists && (existingRequest.data() as FirestoreGroupCreationRequest).status === 'pending_review') {
    throw new HttpsError('already-exists', 'You already have a group request awaiting review for this category.');
  }

  const requesterName = toApplicantName(registration.applicant);
  const batch = firestore.batch();
  batch.set(registrationRef, {
    categoryKey: category.key,
    preferences: {
      ...(registration.preferences ?? {}),
      unitInterest: category.interest,
      paymentTerm: category.paymentTerm,
      maxMembers,
      standaloneInterestId: standaloneInterestId || null,
    },
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });
  batch.set(requestRef,
    {
      userId: request.auth!.uid,
      requesterName,
      requesterEmail: registration.userEmail ?? request.auth!.token.email ?? '',
      cohortId: cohort.id,
      cohortName: cohort.cohortName,
      categoryKey: category.key,
      interest: category.interest,
      interestLabel: category.interestLabel,
      paymentTerm: category.paymentTerm,
      notes,
      status: 'pending_review',
      groupId: null,
      reviewNote: null,
      createdAt: existingRequest.exists ? existingRequest.data()?.createdAt ?? FieldValue.serverTimestamp() : FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
  await batch.commit();

  return { ok: true, requestId: requestRef.id };
});

export const approveGroupCreationRequest = onCall(async (request) => {
  await assertAdmin(request.auth);

  const requestId = typeof request.data?.requestId === 'string' ? request.data.requestId.trim() : '';

  if (!requestId) {
    throw new HttpsError('invalid-argument', 'requestId is required.');
  }

  const requestRef = firestore.doc(`groupCreationRequests/${requestId}`);
  const createdGroup = await firestore.runTransaction(async (transaction) => {
    const creationRequestSnap = await transaction.get(requestRef);

    if (!creationRequestSnap.exists) {
      throw new HttpsError('not-found', 'Group creation request not found.');
    }

    const creationRequest = creationRequestSnap.data() as FirestoreGroupCreationRequest;

    if (creationRequest.status !== 'pending_review' || !creationRequest.userId || !creationRequest.categoryKey) {
      throw new HttpsError('failed-precondition', 'This group request cannot be approved.');
    }

    const registrationRef = firestore.doc(`registrations/${creationRequest.userId}`);
    const registrationSnap = await transaction.get(registrationRef);

    if (!registrationSnap.exists) {
      throw new HttpsError('failed-precondition', 'The requester has no registration record.');
    }

    const registration = registrationSnap.data() as FirestoreRegistration;

    if (registration.status !== 'approved' || registration.categoryKey !== creationRequest.categoryKey) {
      throw new HttpsError('failed-precondition', 'The requester is no longer eligible to start this group.');
    }

    const activeMemberships = activeMembershipsFor(registration);
    if (creationRequest.interest && activeMemberships.some((membership) => membership.interest === creationRequest.interest)) {
      throw new HttpsError('failed-precondition', 'The requester already has an active group for this home interest.');
    }

    const cohortId = creationRequest.cohortId ?? registration.cohortId ?? CITY_OF_ANGELS_COHORT_ID;
    const cohortRef = firestore.doc(`cohorts/${cohortId}`);
    const cohortSnap = await transaction.get(cohortRef);
    const cohort = cohortSnap.exists
      ? ({ ...defaultCohortConfig, ...cohortSnap.data(), id: cohortSnap.id } as CohortConfig)
      : defaultCohortConfig;
    let category = buildCategoriesFromCohort(cohort).find((item) => item.key === creationRequest.categoryKey);
    if (creationRequest.standaloneInterestId) {
      const standaloneSnap = await transaction.get(firestore.doc(`shopInterests/${creationRequest.standaloneInterestId}`));
      const standalone = standaloneSnap.exists ? standaloneSnap.data() as { status?: string; label?: string; paymentTerm?: string; paymentTerms?: string[]; programmeId?: string | null; cohortId?: string | null } : null;
      if (standalone?.status === 'published' && !standalone.programmeId && !standalone.cohortId && creationRequest.categoryKey.startsWith(`standalone:${creationRequest.standaloneInterestId}|`)) {
        const requestedTerm = creationRequest.categoryKey.split('|')[1] ?? '';
        const terms = Array.isArray(standalone.paymentTerms) && standalone.paymentTerms.length ? standalone.paymentTerms : standalone.paymentTerm ? [standalone.paymentTerm] : ['20 Years'];
        const paymentTerm = terms.includes(requestedTerm) ? requestedTerm as PaymentTerm : '20 Years';
        category = { key: creationRequest.categoryKey, interest: creationRequest.standaloneInterestId, interestLabel: standalone.label?.trim() || creationRequest.standaloneInterestId, paymentTerm, label: `${standalone.label?.trim() || creationRequest.standaloneInterestId} - ${paymentTerm}` };
      }
    }

    if (!category || (!creationRequest.standaloneInterestId && cohort.status !== 'active')) {
      throw new HttpsError('failed-precondition', 'The requested group category is no longer active.');
    }

    const matchingGroups = await transaction.get(
      firestore.collection('groups').where('cohortId', '==', cohort.id).where('categoryKey', '==', category.key)
    );
    const cohortNumbers = matchingGroups.docs.map((entry) => (entry.data() as FirestoreGroup).cohortNumber ?? 0);
    const cohortNumber = Math.max(0, ...cohortNumbers) + 1;
    const groupId = createGroupId(category, cohortNumber);
    const groupRef = firestore.doc(`groups/${groupId}`);
    const memberName = toApplicantName(registration.applicant);
    const member = {
      id: creationRequest.userId,
      name: memberName,
      initials: getInitials(memberName),
      joinedAt: new Date().toISOString().slice(0, 10),
    };
    const groupName = cohortNumber === 1 ? `${cohort.projectName} Group` : `${cohort.projectName} Group ${cohortNumber}`;

    transaction.set(groupRef, {
      name: groupName,
      cohortId: cohort.id,
      cohortName: cohort.cohortName,
      projectName: cohort.projectName,
      categoryKey: category.key,
      cohortNumber,
      interest: category.interest,
      interestLabel: category.interestLabel,
      paymentTerm: category.paymentTerm,
      maxMembers: isValidGroupSize(creationRequest.maxMembers) ? creationRequest.maxMembers : cohort.maxMembersPerGroup,
      standaloneInterestId: creationRequest.standaloneInterestId ?? null,
      members: [member],
      status: 'open',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    const membership = {
      groupId,
      interest: category.interest,
      paymentTerm: category.paymentTerm,
      status: 'active' as const,
    };
    transaction.set(registrationRef, {
      assignedGroupId: groupId,
      assignedMemberId: member.id,
      groupMemberships: [...activeMemberships, membership],
      reviewNote: 'Approved to start a new group from the admin dashboard.',
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    transaction.set(firestore.doc(`shopUsers/${creationRequest.userId}`), {
      registrationSubmitted: true,
      registrationCompleted: true,
      assignedGroupId: groupId,
      assignedMemberId: member.id,
      activeGroupIds: [...activeMemberships.map((membership) => membership.groupId), groupId],
      groupMemberships: [...activeMemberships, membership],
      statusTag: 'group_creator',
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    transaction.set(requestRef, {
      status: 'approved',
      groupId,
      reviewNote: 'Approved. Your new group is ready for members.',
      reviewedBy: request.auth!.uid,
      reviewedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    return { id: groupId, name: groupName, memberCount: 1, maxMembers: isValidGroupSize(creationRequest.maxMembers) ? creationRequest.maxMembers : cohort.maxMembersPerGroup, userId: creationRequest.userId };
  });

  const notificationId = await notifyUser(createdGroup.userId, {
    title: 'Your group is ready',
    body: `${createdGroup.name} has been created. Invite eligible members to join it.`,
    route: '/group',
    kind: 'system',
  });
  await sendExpoPush(createdGroup.userId, 'announcementAlerts', {
    title: 'Your group is ready',
    body: `${createdGroup.name} has been created. Invite eligible members to join it.`,
    route: '/group',
    notificationId,
  });
  await publishGroupSystemMessage({
    groupId: createdGroup.id,
    systemKey: 'group-created',
    body: `${createdGroup.name} is open. ${createdGroup.memberCount}/${createdGroup.maxMembers} member spots are now filled.`,
  });

  return { ok: true, groupId: createdGroup.id };
});

export const declineGroupCreationRequest = onCall(async (request) => {
  await assertAdmin(request.auth);

  const requestId = typeof request.data?.requestId === 'string' ? request.data.requestId.trim() : '';
  const reviewNote = typeof request.data?.reviewNote === 'string' ? request.data.reviewNote.trim().slice(0, 1_000) : '';

  if (!requestId) {
    throw new HttpsError('invalid-argument', 'requestId is required.');
  }

  const requestRef = firestore.doc(`groupCreationRequests/${requestId}`);
  const requestSnap = await requestRef.get();

  if (!requestSnap.exists) {
    throw new HttpsError('not-found', 'Group creation request not found.');
  }

  const creationRequest = requestSnap.data() as FirestoreGroupCreationRequest;

  if (creationRequest.status !== 'pending_review' || !creationRequest.userId) {
    throw new HttpsError('failed-precondition', 'This group request cannot be declined.');
  }

  await requestRef.set({
    status: 'declined',
    reviewNote: reviewNote || 'The admin team could not approve this group request.',
    reviewedBy: request.auth!.uid,
    reviewedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });

  const notificationId = await notifyUser(creationRequest.userId, {
    title: 'Group request update',
    body: 'Your group request needs an update. Open Create Group to review and submit it again.',
    route: '/group/create',
    kind: 'system',
  });
  await sendExpoPush(creationRequest.userId, 'announcementAlerts', {
    title: 'Group request update',
    body: 'Your group request needs an update. Open Create Group to review and submit it again.',
    route: '/group/create',
    notificationId,
  });

  return { ok: true };
});

export const joinOpenGroup = onCall(async (request) => {
  assertSignedIn(request.auth);

  const groupId = typeof request.data?.groupId === 'string' ? request.data.groupId.trim() : '';

  if (!groupId) {
    throw new HttpsError('invalid-argument', 'groupId is required.');
  }

  const registrationRef = firestore.doc(`registrations/${request.auth!.uid}`);
  const groupRef = firestore.doc(`groups/${groupId}`);
  const joinedGroup = await firestore.runTransaction(async (transaction) => {
    const [registrationSnap, groupSnap] = await Promise.all([
      transaction.get(registrationRef),
      transaction.get(groupRef),
    ]);

    if (!registrationSnap.exists || !groupSnap.exists) {
      throw new HttpsError('not-found', 'Your registration or the selected group could not be found.');
    }

    const registration = registrationSnap.data() as FirestoreRegistration;
    const group = groupSnap.data() as FirestoreGroup;

    if (registration.status !== 'approved') {
      throw new HttpsError('failed-precondition', 'Your registration must be approved before joining a group.');
    }

    if (!group.categoryKey || !group.interest || !group.paymentTerm) {
      throw new HttpsError('failed-precondition', 'This group is missing its home or payment plan. Please choose another group.');
    }

    const pendingRequestRef = firestore.doc(`groupCreationRequests/${request.auth!.uid}__${group.categoryKey}`);
    const pendingRequestSnap = await transaction.get(pendingRequestRef);

    const existingMembers = group.members ?? [];
    const maxMembers = group.maxMembers ?? MAX_GROUP_MEMBERS;
    const activeMemberships = activeMembershipsFor(registration);

    if (activeMemberships.some((membership) => membership.interest === group.interest)) {
      throw new HttpsError('failed-precondition', 'You already have an active group for this home interest.');
    }

    if (group.status !== 'open' || existingMembers.length >= maxMembers) {
      throw new HttpsError('failed-precondition', 'This group is already full.');
    }

    if (existingMembers.some((member) => member.id === request.auth!.uid)) {
      throw new HttpsError('already-exists', 'You already belong to this group.');
    }

    const memberName = toApplicantName(registration.applicant);
    const members = [
      ...existingMembers,
      {
        id: request.auth!.uid,
        name: memberName,
        initials: getInitials(memberName),
        joinedAt: new Date().toISOString().slice(0, 10),
      },
    ];
    const groupName = group.name?.trim() || 'Your GroupTown group';

    transaction.set(groupRef, {
      members,
      status: members.length >= maxMembers ? 'full' : 'open',
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    const membership = {
      groupId,
      interest: group.interest,
      paymentTerm: group.paymentTerm,
      status: 'active' as const,
    };
    transaction.set(registrationRef, {
      categoryKey: group.categoryKey,
      preferences: {
        ...(registration.preferences ?? {}),
        unitInterest: group.interest,
        paymentTerm: group.paymentTerm,
      },
      assignedGroupId: groupId,
      assignedMemberId: request.auth!.uid,
      groupMemberships: [...activeMemberships, membership],
      reviewNote: 'Joined an open group.',
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    transaction.set(firestore.doc(`shopUsers/${request.auth!.uid}`), {
      registrationSubmitted: true,
      registrationCompleted: true,
      assignedGroupId: groupId,
      assignedMemberId: request.auth!.uid,
      activeGroupIds: [...activeMemberships.map((membership) => membership.groupId), groupId],
      groupMemberships: [...activeMemberships, membership],
      statusTag: 'group_member',
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    if (pendingRequestSnap.exists && (pendingRequestSnap.data() as FirestoreGroupCreationRequest).status === 'pending_review') {
      transaction.set(pendingRequestRef, {
        status: 'declined',
        reviewNote: 'Closed because the member joined an existing group.',
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
    }

    return { id: groupId, name: groupName, memberCount: members.length, maxMembers };
  });

  const notificationId = await notifyUser(request.auth!.uid, {
    title: 'You joined a group',
    body: `You are now a member of ${joinedGroup.name}.`,
    route: '/group',
    kind: 'system',
  });
  await sendExpoPush(request.auth!.uid, 'announcementAlerts', {
    title: 'You joined a group',
    body: `You are now a member of ${joinedGroup.name}.`,
    route: '/group',
    notificationId,
  });
  await publishGroupSystemMessage({
    groupId: joinedGroup.id,
    systemKey: 'member-joined',
    body: `A new member joined the room. ${joinedGroup.memberCount}/${joinedGroup.maxMembers} member spots are now filled.`,
  });

  return { ok: true, groupId: joinedGroup.id };
});

export const requestApplicationCorrection = onCall(async (request) => {
  await assertAdmin(request.auth);

  const registrationId = request.data?.registrationId as string | undefined;

  if (!registrationId) {
    throw new HttpsError('invalid-argument', 'registrationId is required.');
  }

  const registrationRef = firestore.doc(`registrations/${registrationId}`);
  const snap = await registrationRef.get();

  if (!snap.exists) {
    throw new HttpsError('not-found', 'Registration not found.');
  }

  const data = snap.data() as FirestoreRegistration;

  if (!data.userId) {
    throw new HttpsError('failed-precondition', 'Registration is missing a userId.');
  }

  await Promise.all([
    registrationRef.set(
      {
        status: 'corrections_requested',
        reviewNote: 'Correction requested from admin dashboard.',
        reviewedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    ),
    firestore.doc(`shopUsers/${data.userId}`).set(
      {
        statusTag: 'corrections_requested',
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    ),
  ]);

  const notificationId = await notifyUser(data.userId, {
    title: 'Application needs correction',
    body: 'Admin has requested corrections on your application. Open your account and review the latest status.',
    route: '/profile',
    kind: 'system',
  });

  await sendExpoPush(data.userId, 'announcementAlerts', {
    title: 'Application needs correction',
    body: 'Admin has requested corrections on your application. Open your account and review the latest status.',
    route: '/profile',
    notificationId,
  });

  return { ok: true };
});

export const resyncDeliverySlotAvailability = onCall(async (request) => {
  await assertAdmin(request.auth);

  const cohortId = typeof request.data?.cohortId === 'string' && request.data.cohortId.trim()
    ? request.data.cohortId.trim()
    : CITY_OF_ANGELS_COHORT_ID;
  const claimsSnap = await firestore.collection(`cohorts/${cohortId}/deliverySlotClaims`).get();
  const availabilityCollection = firestore.collection(`cohorts/${cohortId}/deliverySlotAvailability`);
  const batch = firestore.batch();

  claimsSnap.docs.forEach((claimDoc) => {
    const claim = claimDoc.data() as FirestoreDeliverySlotClaim;
    const slot =
      claim.deliveryTrack && claim.deliverySlot
        ? {
            unitInterest: claim.unitInterest,
            paymentTerm: claim.paymentTerm,
            deliveryTrack: claim.deliveryTrack,
            deliverySlot: claim.deliverySlot,
          }
        : splitDeliverySlotClaimId(claimDoc.id);

    if (!slot) {
      logger.warn('Skipping malformed delivery slot claim during resync', { cohortId, claimId: claimDoc.id });
      return;
    }

    batch.set(availabilityCollection.doc(claimDoc.id), {
      cohortId,
      ...(slot.unitInterest ? { unitInterest: slot.unitInterest } : {}),
      ...(slot.paymentTerm ? { paymentTerm: slot.paymentTerm } : {}),
      deliveryTrack: slot.deliveryTrack,
      deliverySlot: slot.deliverySlot,
      isAvailable: false,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
  });

  await batch.commit();

  return {
    ok: true,
    cohortId,
    mirroredClaims: claimsSnap.size,
  };
});

export const onGroupMessageCreated = onDocumentCreated('groups/{groupId}/messages/{messageId}', async (event) => {
  const snapshot = event.data;

  if (!snapshot) {
    return;
  }

  const message = snapshot.data() as {
    authorId?: string;
    authorName?: string;
    body?: string;
    kind?: 'member' | 'system';
    attachments?: Array<{ kind?: string }>;
  };

  const groupId = event.params.groupId;
  const groupSnap = await firestore.doc(`groups/${groupId}`).get();

  if (!groupSnap.exists) {
    return;
  }

  const group = groupSnap.data() as {
    members?: Array<{ id?: string }>;
  };

  const memberIds = (group.members ?? [])
    .map((member) => member.id)
    .filter((id): id is string => Boolean(id && id !== message.authorId));

  await Promise.all(
    memberIds.map(async (memberId) => {
      const notificationRef = firestore.collection(`shopUsers/${memberId}/notifications`).doc();
      const title =
        message.kind === 'system'
          ? 'Group update'
          : `${message.authorName ?? 'A member'} sent a new group message`;
      const bodySource =
        message.body?.trim()
        || ((message.attachments?.length ?? 0) > 0 ? 'Open the live chat to view the latest attachment.' : '')
        || 'Open the live chat to view the message.';
      const body = bodySource.slice(0, 140);

      await notificationRef.set({
        title,
        body,
        kind: 'message',
        route: '/group/chat',
        read: false,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        groupId,
      });

      await sendExpoPush(memberId, 'groupMessageAlerts', {
        title,
        body,
        route: '/group/chat',
        notificationId: notificationRef.id,
      });
    })
  );
});

/**
 * Creates one welcome-email job for each newly created SHOP account. The Firebase
 * Trigger Email extension delivers documents written to the configured `mail`
 * collection; this function deliberately keeps email delivery credentials off
 * the mobile client.
 */
export const onShopUserCreated = onDocumentCreated('shopUsers/{userId}', async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    return;
  }

  const user = snapshot.data() as { email?: string; firstName?: string; name?: string };
  const email = user.email?.trim();
  if (!email) {
    logger.warn('Welcome email skipped because the new SHOP user has no email address.', {
      userId: event.params.userId,
    });
    return;
  }

  const firstName = user.firstName?.trim() || user.name?.trim().split(/\s+/)[0] || 'there';
  const welcomeMailRef = firestore.doc(`mail/welcome-${event.params.userId}`);

  try {
    await welcomeMailRef.create({
      to: [email],
      message: {
        subject: `Welcome to GroupTown, ${firstName}`,
        text: [
          `Hello ${firstName},`,
          '',
          'Welcome to GroupTown.',
          'Explore available homes, learn how groups work, and complete your registration whenever you are ready.',
          'You will need to complete your registration before joining or creating a group.',
          '',
          'The GroupTown team',
        ].join('\n'),
      },
      metadata: {
        type: 'welcome',
        userId: event.params.userId,
      },
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    // A repeated Cloud Function event must not create a duplicate welcome email.
    const code = error && typeof error === 'object' && 'code' in error ? error.code : undefined;
    if (code === 6 || code === 'already-exists') {
      return;
    }
    throw error;
  }
});

/** Server-side backstop for the client-side 18+ registration rule. */
export const enforceRegistrationAge = onDocumentWritten('registrations/{registrationId}', async (event) => {
  const snapshot = event.data?.after;
  if (!snapshot?.exists) {
    return;
  }

  const registration = snapshot.data() as {
    userId?: string;
    status?: string;
    eligibilityStatus?: string;
    applicant?: { dateOfBirth?: string };
  };

  if (isAtLeast18(registration.applicant?.dateOfBirth)) {
    if (registration.eligibilityStatus === 'age_ineligible') {
      await snapshot.ref.set(
        {
          eligibilityStatus: FieldValue.delete(),
          reviewNote: FieldValue.delete(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }
    return;
  }

  if (registration.eligibilityStatus === 'age_ineligible') {
    return;
  }

  const userId = registration.userId?.trim() || event.params.registrationId;
  await Promise.all([
    snapshot.ref.set(
      {
        status: 'blocked',
        eligibilityStatus: 'age_ineligible',
        reviewNote: 'Registration is available only to applicants aged 18 or above.',
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    ),
    firestore.doc(`shopUsers/${userId}`).set(
      {
        registrationSubmitted: false,
        registrationCompleted: false,
        statusTag: 'age_ineligible',
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    ),
  ]);
});

export const onGroupFeedPostCreated = onDocumentCreated('groups/{groupId}/posts/{postId}', async (event) => {
  const snapshot = event.data;

  if (!snapshot) {
    return;
  }

  const post = snapshot.data() as {
    authorId?: string;
    authorName?: string;
    body?: string;
    attachments?: Array<{ kind?: string }>;
  };

  const groupId = event.params.groupId;
  const groupSnap = await firestore.doc(`groups/${groupId}`).get();

  if (!groupSnap.exists) {
    return;
  }

  const group = groupSnap.data() as {
    members?: Array<{ id?: string }>;
  };

  const memberIds = (group.members ?? [])
    .map((member) => member.id)
    .filter((id): id is string => Boolean(id && id !== post.authorId));

  await Promise.all(
    memberIds.map(async (memberId) => {
      const notificationRef = firestore.collection(`shopUsers/${memberId}/notifications`).doc();
      const attachmentCount = post.attachments?.length ?? 0;
      const title = `${post.authorName ?? 'A member'} shared a new group post`;
      const bodySource =
        post.body?.trim()
        || (attachmentCount > 0
          ? `Open the group feed to view ${attachmentCount === 1 ? 'the latest upload' : 'the latest uploads'}.`
          : '')
        || 'Open the group feed to catch up with your cohort.';
      const body = bodySource.slice(0, 140);

      await notificationRef.set({
        title,
        body,
        kind: 'message',
        route: '/group',
        read: false,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        groupId,
      });

      await sendExpoPush(memberId, 'groupMessageAlerts', {
        title,
        body,
        route: '/group',
        notificationId: notificationRef.id,
      });
    })
  );
});

export const onCommunityPostCreated = onDocumentCreated('communityPosts/{postId}', async (event) => {
  const snapshot = event.data;
  if (!snapshot) return;

  const post = snapshot.data() as {
    authorId?: string;
    authorName?: string;
    body?: string;
    attachments?: Array<{ kind?: string }>;
  };
  const usersSnap = await firestore.collection('shopUsers').get();
  const recipients = usersSnap.docs.filter((userDoc) => userDoc.id !== post.authorId);
  const attachmentCount = post.attachments?.length ?? 0;
  const title = `${post.authorName ?? 'A member'} shared a community post`;
  const body = (post.body?.trim() || (attachmentCount > 0
    ? `Open the Community feed to view ${attachmentCount === 1 ? 'the latest upload' : 'the latest uploads'}.`
    : 'Open the Community feed to catch up.')).slice(0, 140);

  await Promise.all(recipients.map(async (userDoc) => {
    const notificationRef = firestore.collection(`shopUsers/${userDoc.id}/notifications`).doc();
    await notificationRef.set({
      title,
      body,
      kind: 'message',
      route: '/group?feedScope=community',
      read: false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      feedScope: 'community',
      postId: event.params.postId,
    });
    await sendExpoPush(userDoc.id, 'communityAlerts', {
      title,
      body,
      route: '/group?feedScope=community',
      notificationId: notificationRef.id,
    });
  }));
});

export const onCommunityPostCommentCreated = onDocumentCreated('communityPosts/{postId}/comments/{commentId}', async (event) => {
  const snapshot = event.data;
  if (!snapshot) return;
  const comment = snapshot.data() as { authorId?: string; authorName?: string; body?: string };
  const postSnap = await firestore.doc(`communityPosts/${event.params.postId}`).get();
  if (!postSnap.exists) return;
  const post = postSnap.data() as { authorId?: string };
  if (!post.authorId || post.authorId === comment.authorId) return;
  const notificationRef = firestore.collection(`shopUsers/${post.authorId}/notifications`).doc();
  const title = `${comment.authorName ?? 'A member'} commented on your community post`;
  const body = (comment.body?.trim() || 'Open Community to view the new comment.').slice(0, 140);
  await notificationRef.set({ title, body, kind: 'message', route: '/group?feedScope=community', feedScope: 'community', postId: event.params.postId, read: false, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
  await sendExpoPush(post.authorId, 'communityAlerts', { title, body, route: '/group?feedScope=community', notificationId: notificationRef.id });
});

export const onCommunityPostLikeCreated = onDocumentCreated('communityPosts/{postId}/likes/{userId}', async (event) => {
  const snapshot = event.data;
  if (!snapshot) return;
  const postSnap = await firestore.doc(`communityPosts/${event.params.postId}`).get();
  if (!postSnap.exists) return;
  const post = postSnap.data() as { authorId?: string; body?: string };
  const likerId = event.params.userId;
  if (!post.authorId || post.authorId === likerId) return;
  const likerSnap = await firestore.doc(`shopUsers/${likerId}`).get();
  const liker = likerSnap.data() as { name?: string } | undefined;
  const notificationRef = firestore.collection(`shopUsers/${post.authorId}/notifications`).doc();
  const title = `${liker?.name ?? 'A member'} reacted to your community post`;
  const body = 'Open Community to view the reaction.';
  await notificationRef.set({ title, body, kind: 'message', route: '/group?feedScope=community', feedScope: 'community', postId: event.params.postId, read: false, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
  await sendExpoPush(post.authorId, 'communityAlerts', { title, body, route: '/group?feedScope=community', notificationId: notificationRef.id });
});

export const onAnnouncementCreated = onDocumentCreated('announcements/{announcementId}', async (event) => {
  const snapshot = event.data;

  if (!snapshot) {
    return;
  }

  const announcement = snapshot.data() as {
    title?: string;
    body?: string;
    route?: string | null;
  };

  const usersSnap = await firestore.collection('shopUsers').get();

  await Promise.all(
    usersSnap.docs.map(async (userDoc) => {
      const notificationRef = firestore.collection(`shopUsers/${userDoc.id}/notifications`).doc();
      const title = announcement.title ?? 'Admin announcement';
      const body = announcement.body ?? 'New admin update available.';

      await notificationRef.set({
        title,
        body,
        kind: 'announcement',
        route: announcement.route ?? '/notifications',
        read: false,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      await sendExpoPush(userDoc.id, 'announcementAlerts', {
        title,
        body,
        route: announcement.route ?? '/notifications',
        notificationId: notificationRef.id,
      });
    })
  );
});

export const onSupportTicketCreated = onDocumentCreated('supportTickets/{ticketId}', async (event) => {
  const snapshot = event.data;

  if (!snapshot) {
    return;
  }

  const ticket = snapshot.data() as {
    ownerId?: string;
    subject?: string;
    category?: string;
  };

  if (!ticket.ownerId) {
    return;
  }

  const notificationRef = firestore.collection(`shopUsers/${ticket.ownerId}/notifications`).doc();
  const title = 'Support ticket received';
  const body = `Your ${ticket.category ?? 'General'} request "${ticket.subject ?? 'Support request'}" is now in the admin queue.`;

  await notificationRef.set({
    title,
    body,
    kind: 'support',
    route: '/support',
    read: false,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  await sendExpoPush(ticket.ownerId, 'supportAlerts', {
    title,
    body,
    route: '/support',
    notificationId: notificationRef.id,
  });
});

export const onPaymentTransactionCreated = onDocumentCreated(
  'shopUsers/{userId}/transactions/{transactionId}',
  async (event) => {
    const snapshot = event.data;

    if (!snapshot) {
      return;
    }

    const transaction = snapshot.data() as FirestoreTransaction;

    if (!isPaymentReminderCandidate(transaction)) {
      return;
    }

    const userId = event.params.userId;
    const transactionId = event.params.transactionId;
    const { title, body } = buildPaymentReminderMessage(transaction);
    const notificationId = `payment-${transactionId}`;

    await notifyUserWithId(userId, notificationId, {
      title,
      body,
      route: '/notifications',
      kind: 'payment',
    });

    await sendExpoPush(userId, 'paymentReminders', {
      title,
      body,
      route: '/notifications',
      notificationId,
    });
  }
);

export const onDeliverySlotClaimWritten = onDocumentWritten(
  'cohorts/{cohortId}/deliverySlotClaims/{claimId}',
  async (event) => {
    const before = event.data?.before.exists ? (event.data.before.data() as FirestoreDeliverySlotClaim) : undefined;
    const after = event.data?.after.exists ? (event.data.after.data() as FirestoreDeliverySlotClaim) : undefined;
    const data = after ?? before;

    if (!data) {
      return;
    }

    await syncDeliverySlotAvailability(event.params.cohortId, event.params.claimId, data, !after);

    const userId = after?.userId ?? before?.userId;

    if (!userId) {
      return;
    }

    const userSnap = await firestore.doc(`shopUsers/${userId}`).get();

    if (!userSnap.exists) {
      return;
    }

    const shopUser = userSnap.data() as Partial<{
      assignedGroupId: string | null;
    }>;
    const assignedGroupId = shopUser.assignedGroupId?.trim();

    if (!assignedGroupId) {
      return;
    }

    const deliveryTrack = after?.deliveryTrack ?? before?.deliveryTrack ?? 'delivery track';
    const deliverySlot = after?.deliverySlot ?? before?.deliverySlot ?? 'delivery slot';
    const wasRemoved = !after;
    const changedSlot = before && after
      ? before.deliveryTrack !== after.deliveryTrack || before.deliverySlot !== after.deliverySlot
      : false;

    if (wasRemoved) {
      await publishGroupSystemMessage({
        groupId: assignedGroupId,
        systemKey: 'delivery-slot-released',
        body: `A delivery preference in ${deliveryTrack} for ${deliverySlot} was released and is available again.`,
      });
      return;
    }

    if (!before || changedSlot) {
      await publishGroupSystemMessage({
        groupId: assignedGroupId,
        systemKey: 'delivery-slot-reserved',
        body: `A delivery preference in ${deliveryTrack} for ${deliverySlot} was reserved for this cohort.`,
      });
    }
  }
);
