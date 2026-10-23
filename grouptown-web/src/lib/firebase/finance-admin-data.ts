import { collection, doc, getDoc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';

import { getDb, getFunctionsClient } from './client';

export const CITY_OF_ANGELS_COHORT_ID = 'city-of-angels-cohort-01';
export const PAYMENT_TERM_OPTIONS = ['5 Years', '10 Years', '15 Years', '20 Years', '25 Years', '30 Years'] as const;
export type PaymentTerm = (typeof PAYMENT_TERM_OPTIONS)[number];
export type FinanceUnitInterest = string;

export type DeliverySlotKey = 'slot-1' | 'slot-2' | 'slot-3';
export type DeliveryTrackKey =
  | 'immediate-occupancy'
  | 'first-scheduled-delivery'
  | 'second-scheduled-delivery'
  | 'third-scheduled-delivery'
  | 'fourth-scheduled-delivery'
  | 'fifth-scheduled-delivery';

export type FinanceDeliverySlot = {
  key: DeliverySlotKey;
  label: string;
  isAvailable: boolean;
  memberPrice: number;
  initialDeposit: number;
  monthlyContribution: number;
  unitMonthlyContributions?: Record<string, number>;
  paymentTermMonthlyContributions?: FinancePaymentTermContributionMap;
  targetCompletionMonths: number;
};

export type FinanceDeliveryTrack = {
  key: DeliveryTrackKey;
  label: string;
  description: string;
  slots: FinanceDeliverySlot[];
};

export type FinanceUnitPriceMap = Record<string, number>;

export type FinancePaymentTermContributionMap = Record<PaymentTerm, FinanceUnitPriceMap>;

export type FinanceGatewayChargeType = 'down-payment' | 'full-price' | 'custom';

export type FinancePaystackSettings = {
  enabled: boolean;
  mode: 'test';
  currency: 'GHS' | 'USD';
  callbackPath: string;
  publicKeyEnvVar: string;
  defaultCustomerEmail: string;
  defaultChargeType: FinanceGatewayChargeType;
  defaultUnitInterest: FinanceUnitInterest;
  customTestAmount: number;
};

export type FinanceTemplate = {
  cohortId: string;
  comparisonLabel: string;
  currencySymbol: string;
  contributionGoalLabel: string;
  adminNote: string;
  downPaymentRate: number;
  unitPrices: FinanceUnitPriceMap;
  paymentGateway: FinancePaystackSettings;
  deliveryTracks: FinanceDeliveryTrack[];
};

type FirestoreFinanceTemplate = Partial<FinanceTemplate>;
type FirestoreDeliverySlotAvailability = Partial<{
  deliveryTrack: DeliveryTrackKey;
  deliverySlot: DeliverySlotKey;
  isAvailable: boolean;
}>;

const deliveryTrackDefinitions: Array<{
  key: DeliveryTrackKey;
  label: string;
  description: string;
  slots: Array<{ key: DeliverySlotKey; label: string; monthly2Bedroom: number; monthly3Bedroom: number; targetCompletionMonths: number }>;
}> = [
  {
    key: 'immediate-occupancy',
    label: 'Immediate Occupancy',
    description: 'Existing units available for immediate move-in.',
    slots: [{ key: 'slot-1', label: 'Slot 1', monthly2Bedroom: 680, monthly3Bedroom: 952, targetCompletionMonths: 0 }],
  },
  {
    key: 'first-scheduled-delivery',
    label: 'Year 1 Delivery',
    description: 'Earliest scheduled delivery option after immediate occupancy.',
    slots: [
      { key: 'slot-1', label: 'Slot 1', monthly2Bedroom: 660, monthly3Bedroom: 924, targetCompletionMonths: 12 },
      { key: 'slot-2', label: 'Slot 2', monthly2Bedroom: 660, monthly3Bedroom: 924, targetCompletionMonths: 12 },
    ],
  },
  {
    key: 'second-scheduled-delivery',
    label: 'Year 2 Delivery',
    description: 'Second-wave scheduled delivery track.',
    slots: [
      { key: 'slot-1', label: 'Slot 1', monthly2Bedroom: 640, monthly3Bedroom: 896, targetCompletionMonths: 24 },
      { key: 'slot-2', label: 'Slot 2', monthly2Bedroom: 640, monthly3Bedroom: 896, targetCompletionMonths: 24 },
    ],
  },
  {
    key: 'third-scheduled-delivery',
    label: 'Year 3 Delivery',
    description: 'Third scheduled delivery pathway.',
    slots: [
      { key: 'slot-1', label: 'Slot 1', monthly2Bedroom: 620, monthly3Bedroom: 868, targetCompletionMonths: 36 },
      { key: 'slot-2', label: 'Slot 2', monthly2Bedroom: 620, monthly3Bedroom: 868, targetCompletionMonths: 36 },
    ],
  },
  {
    key: 'fourth-scheduled-delivery',
    label: 'Year 4 Delivery',
    description: 'Fourth scheduled delivery pathway.',
    slots: [
      { key: 'slot-1', label: 'Slot 1', monthly2Bedroom: 600, monthly3Bedroom: 840, targetCompletionMonths: 48 },
      { key: 'slot-2', label: 'Slot 2', monthly2Bedroom: 600, monthly3Bedroom: 840, targetCompletionMonths: 48 },
    ],
  },
  {
    key: 'fifth-scheduled-delivery',
    label: 'Year 5 Delivery',
    description: 'Longest delivery runway with the widest slot set.',
    slots: [
      { key: 'slot-1', label: 'Slot 1', monthly2Bedroom: 580, monthly3Bedroom: 812, targetCompletionMonths: 60 },
      { key: 'slot-2', label: 'Slot 2', monthly2Bedroom: 580, monthly3Bedroom: 812, targetCompletionMonths: 60 },
      { key: 'slot-3', label: 'Slot 3', monthly2Bedroom: 580, monthly3Bedroom: 812, targetCompletionMonths: 60 },
    ],
  },
];

function getDefaultSlotDefinition(
  trackIndex: number,
  slotIndex: number
) {
  return deliveryTrackDefinitions[trackIndex]?.slots[slotIndex];
}

function buildPaymentTermContributions(
  twoBedroomAmount: number,
  threeBedroomAmount: number
): FinancePaymentTermContributionMap {
  return PAYMENT_TERM_OPTIONS.reduce((acc, paymentTerm) => {
    acc[paymentTerm] = {
      '2-bedroom': twoBedroomAmount,
      '3-bedroom': threeBedroomAmount,
    };
    return acc;
  }, {} as FinancePaymentTermContributionMap);
}

export const defaultFinanceTemplate: FinanceTemplate = {
  cohortId: CITY_OF_ANGELS_COHORT_ID,
  comparisonLabel: 'Bedroom Payment Plan',
  currencySymbol: '$',
  contributionGoalLabel: '5% Down Payment Goal',
  adminNote:
    'Admins set the cash selling price for 2-bedroom and 3-bedroom units, the down payment rate, and the monthly amount for each delivery year here.',
  downPaymentRate: 5,
  unitPrices: {
    '2-bedroom': 125000,
    '3-bedroom': 175000,
  },
  paymentGateway: {
    enabled: false,
    mode: 'test',
    currency: 'GHS',
    callbackPath: '/dashboard',
    publicKeyEnvVar: 'NEXT_PUBLIC_PAYSTACK_TEST_PUBLIC_KEY',
    defaultCustomerEmail: 'payments-test@grouptown.com',
    defaultChargeType: 'down-payment',
    defaultUnitInterest: '2-bedroom',
    customTestAmount: 100,
  },
  deliveryTracks: deliveryTrackDefinitions.map((track) => ({
    key: track.key,
    label: track.label,
    description: track.description,
    slots: track.slots.map((slot) => ({
      key: slot.key,
      label: slot.label,
      isAvailable: true,
      memberPrice: 125000,
      initialDeposit: 6250,
      monthlyContribution: slot.monthly2Bedroom,
      unitMonthlyContributions: {
        '2-bedroom': slot.monthly2Bedroom,
        '3-bedroom': slot.monthly3Bedroom,
      },
      paymentTermMonthlyContributions: buildPaymentTermContributions(slot.monthly2Bedroom, slot.monthly3Bedroom),
      targetCompletionMonths: slot.targetCompletionMonths,
    })),
  })),
};

function templateRef(cohortId: string) {
  const db = getDb();
  return db ? doc(db, 'financeTemplates', cohortId) : null;
}

function normalizeTemplate(input?: FirestoreFinanceTemplate): FinanceTemplate {
  const source = input ?? {};
  const unitPrices = source.unitPrices as Partial<FinanceUnitPriceMap> | undefined;
  const paymentGateway = source.paymentGateway as Partial<FinancePaystackSettings> | undefined;

  return {
    cohortId: source.cohortId?.trim() || defaultFinanceTemplate.cohortId,
    comparisonLabel: source.comparisonLabel?.trim() || defaultFinanceTemplate.comparisonLabel,
    currencySymbol: source.currencySymbol?.trim() || defaultFinanceTemplate.currencySymbol,
    contributionGoalLabel:
      source.contributionGoalLabel?.trim() || defaultFinanceTemplate.contributionGoalLabel,
    adminNote: source.adminNote?.trim() || defaultFinanceTemplate.adminNote,
    downPaymentRate:
      typeof source.downPaymentRate === 'number' && Number.isFinite(source.downPaymentRate)
        ? source.downPaymentRate
        : defaultFinanceTemplate.downPaymentRate,
    unitPrices: Object.entries(unitPrices ?? {}).reduce<FinanceUnitPriceMap>(
      (prices, [interestId, value]) => {
        if (typeof value === 'number' && Number.isFinite(value)) prices[interestId] = value;
        return prices;
      },
      { ...defaultFinanceTemplate.unitPrices }
    ),
    paymentGateway: {
      enabled:
        typeof paymentGateway?.enabled === 'boolean'
          ? paymentGateway.enabled
          : defaultFinanceTemplate.paymentGateway.enabled,
      mode: 'test',
      currency:
        paymentGateway?.currency === 'USD' || paymentGateway?.currency === 'GHS'
          ? paymentGateway.currency
          : defaultFinanceTemplate.paymentGateway.currency,
      callbackPath:
        typeof paymentGateway?.callbackPath === 'string' && paymentGateway.callbackPath.trim()
          ? paymentGateway.callbackPath.trim()
          : defaultFinanceTemplate.paymentGateway.callbackPath,
      publicKeyEnvVar:
        typeof paymentGateway?.publicKeyEnvVar === 'string' && paymentGateway.publicKeyEnvVar.trim()
          ? paymentGateway.publicKeyEnvVar.trim()
          : defaultFinanceTemplate.paymentGateway.publicKeyEnvVar,
      defaultCustomerEmail:
        typeof paymentGateway?.defaultCustomerEmail === 'string'
          ? paymentGateway.defaultCustomerEmail.trim()
          : defaultFinanceTemplate.paymentGateway.defaultCustomerEmail,
      defaultChargeType:
        paymentGateway?.defaultChargeType === 'full-price' ||
        paymentGateway?.defaultChargeType === 'custom' ||
        paymentGateway?.defaultChargeType === 'down-payment'
          ? paymentGateway.defaultChargeType
          : defaultFinanceTemplate.paymentGateway.defaultChargeType,
      defaultUnitInterest:
        paymentGateway?.defaultUnitInterest === '3-bedroom' || paymentGateway?.defaultUnitInterest === '2-bedroom'
          ? paymentGateway.defaultUnitInterest
          : defaultFinanceTemplate.paymentGateway.defaultUnitInterest,
      customTestAmount:
        typeof paymentGateway?.customTestAmount === 'number' && Number.isFinite(paymentGateway.customTestAmount)
          ? paymentGateway.customTestAmount
          : defaultFinanceTemplate.paymentGateway.customTestAmount,
    },
    deliveryTracks:
      source.deliveryTracks?.length && Array.isArray(source.deliveryTracks)
        ? source.deliveryTracks.map((track, trackIndex) => ({
            ...track,
            slots: Array.isArray(track.slots)
              ? track.slots.map((slot, slotIndex) => {
                  const fallbackSlot = defaultFinanceTemplate.deliveryTracks[trackIndex]?.slots[slotIndex];
                  const sourceUnitMonthlyContributions = slot.unitMonthlyContributions as
                    | Partial<{
                        '2-bedroom': number;
                        '3-bedroom': number;
                      }>
                    | undefined;
                  const sourcePaymentTermMonthlyContributions = slot.paymentTermMonthlyContributions as
                    | Partial<Record<PaymentTerm, Partial<FinanceUnitPriceMap>>>
                    | undefined;
                  const normalizedUnitMonthlyContributions = {
                    '2-bedroom':
                      typeof sourceUnitMonthlyContributions?.['2-bedroom'] === 'number' &&
                      Number.isFinite(sourceUnitMonthlyContributions['2-bedroom'])
                        ? sourceUnitMonthlyContributions['2-bedroom']
                        : fallbackSlot?.unitMonthlyContributions?.['2-bedroom'] ?? slot.monthlyContribution,
                    '3-bedroom':
                      typeof sourceUnitMonthlyContributions?.['3-bedroom'] === 'number' &&
                      Number.isFinite(sourceUnitMonthlyContributions['3-bedroom'])
                        ? sourceUnitMonthlyContributions['3-bedroom']
                        : fallbackSlot?.unitMonthlyContributions?.['3-bedroom'] ?? slot.monthlyContribution,
                  };
                  const paymentTermMonthlyContributions = PAYMENT_TERM_OPTIONS.reduce((acc, paymentTerm) => {
                    const sourceTermValues = sourcePaymentTermMonthlyContributions?.[paymentTerm];
                    const fallbackTermValues = fallbackSlot?.paymentTermMonthlyContributions?.[paymentTerm];
                    acc[paymentTerm] = {
                      '2-bedroom':
                        typeof sourceTermValues?.['2-bedroom'] === 'number' &&
                        Number.isFinite(sourceTermValues['2-bedroom'])
                          ? sourceTermValues['2-bedroom']
                          : fallbackTermValues?.['2-bedroom'] ?? normalizedUnitMonthlyContributions['2-bedroom'],
                      '3-bedroom':
                        typeof sourceTermValues?.['3-bedroom'] === 'number' &&
                        Number.isFinite(sourceTermValues['3-bedroom'])
                          ? sourceTermValues['3-bedroom']
                          : fallbackTermValues?.['3-bedroom'] ?? normalizedUnitMonthlyContributions['3-bedroom'],
                    };
                    return acc;
                  }, {} as FinancePaymentTermContributionMap);

                  return {
                    ...slot,
                    unitMonthlyContributions: normalizedUnitMonthlyContributions,
                    paymentTermMonthlyContributions,
                    targetCompletionMonths:
                      getDefaultSlotDefinition(trackIndex, slotIndex)?.targetCompletionMonths ??
                      slot.targetCompletionMonths,
                  };
                })
              : [],
          }))
        : defaultFinanceTemplate.deliveryTracks,
  };
}

function toSlotSelectionKey(trackKey: DeliveryTrackKey, slotKey: DeliverySlotKey) {
  return `${trackKey}:${slotKey}`;
}

async function getTakenSlotKeys(cohortId: string) {
  const db = getDb();

  if (!db) {
    return new Set<string>();
  }

  try {
    const availabilitySnap = await getDocs(
      collection(doc(db, 'cohorts', cohortId), 'deliverySlotAvailability')
    );

    const taken = new Set<string>();

    availabilitySnap.docs.forEach((entry) => {
      const data = entry.data() as FirestoreDeliverySlotAvailability;
      const trackKey = data.deliveryTrack;
      const slotKey = data.deliverySlot;

      if (trackKey && slotKey && data.isAvailable === false) {
        taken.add(toSlotSelectionKey(trackKey, slotKey));
      }
    });

    return taken;
  } catch {
    return new Set<string>();
  }
}

function applyLiveSlotAvailability(template: FinanceTemplate, takenSlotKeys: Set<string>): FinanceTemplate {
  return {
    ...template,
    deliveryTracks: template.deliveryTracks.map((track) => ({
      ...track,
      slots: track.slots.map((slot) => ({
        ...slot,
        isAvailable: !takenSlotKeys.has(toSlotSelectionKey(track.key, slot.key)),
      })),
    })),
  };
}

export async function getFinanceTemplate(cohortId = CITY_OF_ANGELS_COHORT_ID) {
  const ref = templateRef(cohortId);

  if (!ref) {
    return {
      template: defaultFinanceTemplate,
      usedFirebase: false,
      hasPublishedBedroomPrices: false,
      hasPublishedDownPaymentRate: false,
    };
  }

  try {
    const takenSlotKeys = await getTakenSlotKeys(cohortId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      const liveTemplate = applyLiveSlotAvailability({ ...defaultFinanceTemplate, cohortId }, takenSlotKeys);
      await setDoc(
        ref,
        {
          ...liveTemplate,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      return {
        template: liveTemplate,
        usedFirebase: true,
        hasPublishedBedroomPrices: true,
        hasPublishedDownPaymentRate: true,
      };
    }

    const source = snap.data() as FirestoreFinanceTemplate;
    const sourceUnitPrices = source.unitPrices as Partial<FinanceUnitPriceMap> | undefined;
    const hasPublishedBedroomPrices =
      typeof sourceUnitPrices?.['2-bedroom'] === 'number' &&
      sourceUnitPrices['2-bedroom'] > 0 &&
      typeof sourceUnitPrices?.['3-bedroom'] === 'number' &&
      sourceUnitPrices['3-bedroom'] > 0;
    const hasPublishedDownPaymentRate =
      typeof source.downPaymentRate === 'number' &&
      Number.isFinite(source.downPaymentRate) &&
      source.downPaymentRate >= 0 &&
      source.downPaymentRate <= 100;
    const normalized = normalizeTemplate(source);

    return {
      template: applyLiveSlotAvailability(normalized, takenSlotKeys),
      usedFirebase: true,
      hasPublishedBedroomPrices,
      hasPublishedDownPaymentRate,
    };
  } catch {
    return {
      template: defaultFinanceTemplate,
      usedFirebase: false,
      hasPublishedBedroomPrices: false,
      hasPublishedDownPaymentRate: false,
    };
  }
}

export async function saveFinanceTemplate(template: FinanceTemplate) {
  const functions = getFunctionsClient();

  if (!functions) {
    return false;
  }

  try {
    const takenSlotKeys = await getTakenSlotKeys(template.cohortId);
    const liveTemplate = applyLiveSlotAvailability(template, takenSlotKeys);
    const saveTemplate = httpsCallable<{ template: FinanceTemplate }, { ok?: boolean }>(functions, 'saveFinanceTemplate');
    const result = await saveTemplate({ template: liveTemplate });
    return result.data?.ok === true;
  } catch {
    return false;
  }
}
