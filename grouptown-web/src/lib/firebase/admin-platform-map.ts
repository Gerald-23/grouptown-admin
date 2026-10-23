export type AdminModuleKey =
  | 'overview'
  | 'programmes'
  | 'interests'
  | 'community'
  | 'applications'
  | 'broadcasts'
  | 'groups'
  | 'members'
  | 'media'
  | 'settings'
  | 'errors'
  | 'audit';

export type AdminMetric = {
  label: string;
  value: string;
  meta: string;
};

export type FirebaseResponsibility = {
  area: string;
  firestore: string[];
  auth?: string[];
  functions?: string[];
  storage?: string[];
  adminActions: string[];
};

export type AdminModuleConfig = {
  key: AdminModuleKey;
  title: string;
  summary: string;
  status: string;
  queueLabel: string;
  queueValue: string;
  primaryAction: string;
  recordsLabel: string;
  tableHeaders: [string, string, string];
  tableRows: AdminTableRow[];
  quickActions: string[];
  responsibilities: FirebaseResponsibility[];
};

export type AdminTableRow = {
  primary: string;
  secondary: string;
  middle: string;
  trailing: string;
  trailingMeta: string;
};

export const adminMetrics: AdminMetric[] = [
  { label: 'Pending applications', value: '18', meta: 'Awaiting admin review' },
  { label: 'Live broadcasts', value: '06', meta: 'Interest groups visible to guests' },
  { label: 'Open groups', value: '14', meta: 'Across SHOP waiting rooms' },
  { label: 'Audit events', value: '128', meta: 'Last 7 days' },
];

export const adminModules: AdminModuleConfig[] = [
  {
    key: 'applications',
    title: 'Applications',
    summary:
      'Review SHOP applications, validate readiness, approve or reject submissions, and unlock group participation eligibility.',
    status: 'Review queue active',
    queueLabel: 'Items awaiting action',
    queueValue: '18',
    primaryAction: 'Open application queue',
    recordsLabel: 'Priority submissions',
    tableHeaders: ['Applicant', 'Readiness', 'Next admin action'],
    tableRows: [
      {
        primary: 'Akosua Mensah',
        secondary: 'KBTH / Nurse / C04',
        middle: '91% ready',
        trailing: 'Approve or request correction',
        trailingMeta: 'Documents uploaded 2h ago',
      },
      {
        primary: 'Kojo Agyeman',
        secondary: 'Teacher / Scheduled delivery',
        middle: 'Missing proof of income',
        trailing: 'Request correction',
        trailingMeta: '1 unresolved checklist item',
      },
      {
        primary: 'Priscilla Arthur',
        secondary: 'Radiographer / Immediate occupancy',
        middle: '88% ready',
        trailing: 'Approve after ID check',
        trailingMeta: 'Identity review in progress',
      },
    ],
    quickActions: [
      'Approve application and unlock group eligibility',
      'Reject with a structured reason',
      'Request document correction without deleting the record',
    ],
    responsibilities: [
      {
        area: 'Application review',
        firestore: ['applications', 'profiles', 'programmeEligibility'],
        functions: ['approveApplicationAndAssign', 'requestApplicationCorrection'],
        storage: ['application-documents'],
        adminActions: [
          'Approve SHOP application',
          'Reject application with reason',
          'Request missing document resubmission',
        ],
      },
    ],
  },
  {
    key: 'broadcasts',
    title: 'Broadcasts',
    summary:
      'Moderate active interest broadcasts, change visibility, and keep guest-facing supply clean before Firebase publishing goes live.',
    status: 'Guest feed controlled',
    queueLabel: 'Live broadcasts',
    queueValue: '06',
    primaryAction: 'Moderate broadcasts',
    recordsLabel: 'Visible guest feed',
    tableHeaders: ['Broadcast', 'State', 'Moderator action'],
    tableRows: [
      {
        primary: 'New Airport City Cohort 02',
        secondary: '7 of 12 members / public',
        middle: 'Featured on guest home',
        trailing: 'Keep live or archive',
        trailingMeta: 'Last edited by admin 3h ago',
      },
      {
        primary: 'Family Wealth Circle Alpha',
        secondary: '9 of 12 members / priority fill',
        middle: 'Priority placement active',
        trailing: 'Pin or downgrade',
        trailingMeta: 'Near completion threshold',
      },
      {
        primary: 'Sedan Growth Corridor Circle',
        secondary: '3 of 12 members / draft',
        middle: 'Not yet public',
        trailing: 'Publish after review',
        trailingMeta: 'Creator awaiting moderation',
      },
    ],
    quickActions: [
      'Publish a draft broadcast into the guest feed',
      'Archive stale or invalid interest records',
      'Promote one broadcast as featured',
    ],
    responsibilities: [
      {
        area: 'Broadcast moderation',
        firestore: ['broadcasts', 'groups'],
        functions: ['publishBroadcast', 'archiveBroadcast', 'featureBroadcast'],
        adminActions: [
          'Publish or hide a broadcast',
          'Mark a broadcast as featured',
          'Archive invalid or stale interest records',
        ],
      },
    ],
  },
  {
    key: 'groups',
    title: 'Groups',
    summary:
      'Manage circle formation, waiting-room composition, membership caps, and the transition from interest to active SHOP group.',
    status: 'Circle formation tracked',
    queueLabel: 'Incomplete circles',
    queueValue: '09',
    primaryAction: 'Manage groups',
    recordsLabel: 'Active waiting rooms',
    tableHeaders: ['Group', 'Membership state', 'Admin intervention'],
    tableRows: [
      {
        primary: 'Cohort 03 / Circle B',
        secondary: '4 of 12 members',
        middle: 'Waiting room open',
        trailing: 'Assign members or merge',
        trailingMeta: 'Creator requested visibility boost',
      },
      {
        primary: 'Family Wealth Circle Alpha',
        secondary: '9 of 12 members',
        middle: 'Priority fill',
        trailing: 'Prepare lock path',
        trailingMeta: '3 more members needed',
      },
      {
        primary: 'Cohort 02 / Circle A',
        secondary: '12 of 12 members',
        middle: 'Ready for lock',
        trailing: 'Lock and notify',
        trailingMeta: 'All members verified',
      },
    ],
    quickActions: [
      'Move approved members into a waiting room',
      'Lock a complete 12-member circle',
      'Resolve duplicate or overflow membership',
    ],
    responsibilities: [
      {
        area: 'Group operations',
        firestore: ['groups', 'memberships', 'broadcasts'],
        functions: ['assignMemberToGroup', 'removeMemberFromGroup', 'lockGroupCircle'],
        adminActions: [
          'Move a member into a group',
          'Lock a 12-member circle',
          'Resolve waiting-room overflows',
        ],
      },
    ],
  },
  {
    key: 'members',
    title: 'Members',
    summary:
      'View member identity, eligibility status, group participation, and account state before direct Firebase admin operations are exposed.',
    status: 'Identity oversight ready',
    queueLabel: 'Flagged members',
    queueValue: '04',
    primaryAction: 'Open member records',
    recordsLabel: 'Escalated member accounts',
    tableHeaders: ['Member', 'Flag', 'Admin action'],
    tableRows: [
      {
        primary: 'Vida Owusu',
        secondary: 'Nurse / Cohort 02',
        middle: 'Phone mismatch',
        trailing: 'Request re-verification',
        trailingMeta: 'Identity drift detected',
      },
      {
        primary: 'Samuel Koranteng',
        secondary: 'Pharmacist / Circle Alpha',
        middle: 'Contribution warning',
        trailing: 'Pause group assignment',
        trailingMeta: 'Awaiting admin contact',
      },
      {
        primary: 'Mabel Quaye',
        secondary: 'Creator / Cohort 03',
        middle: 'Elevated creator privileges',
        trailing: 'Review role claims',
        trailingMeta: 'Broadcast owner controls enabled',
      },
    ],
    quickActions: [
      'Suspend or restore member access',
      'Set creator or reviewer role claims',
      'Inspect profile, eligibility, and group history in one view',
    ],
    responsibilities: [
      {
        area: 'Member management',
        firestore: ['profiles', 'programmeEligibility', 'memberships'],
        auth: ['User status flags', 'Role claims'],
        functions: ['suspendMemberAccess', 'restoreMemberAccess', 'setMemberRole'],
        adminActions: [
          'Suspend a member',
          'Restore a suspended member',
          'Set role or eligibility state',
        ],
      },
    ],
  },
  {
    key: 'settings',
    title: 'Programme Settings',
    summary:
      'Control editable SHOP configuration like cohort size, occupancy modes, package labels, and admin notices without exposing raw Firebase structure.',
    status: 'Configuration ready',
    queueLabel: 'Config sections',
    queueValue: '05',
    primaryAction: 'Edit settings',
    recordsLabel: 'Editable programme settings',
    tableHeaders: ['Setting', 'Current value', 'Admin action'],
    tableRows: [
      {
        primary: 'Circle target size',
        secondary: '12 members',
        middle: 'Live config',
        trailing: 'Change via publish flow',
        trailingMeta: 'Used by groups and broadcasts',
      },
      {
        primary: 'Finance comparison template',
        secondary: 'Per-member price, deposit, monthly, transactions',
        middle: 'Admin pricing matrix',
        trailing: 'Publish finance template',
        trailingMeta: 'Controls member finance requirements, slot claims, and transaction records',
      },
      {
        primary: 'Occupancy pathways',
        secondary: 'Immediate / 1st-5th Scheduled',
        middle: 'Visible on member application',
        trailing: 'Edit option labels',
        trailingMeta: 'Shared by mobile and web',
      },
      {
        primary: 'Guest banner notice',
        secondary: 'No active notice',
        middle: 'Public content block',
        trailing: 'Publish admin message',
        trailingMeta: 'Homepage propagation pending backend',
      },
    ],
    quickActions: [
      'Change programme configuration without manual database edits',
      'Publish a new admin notice or banner',
      'Version and release settings through one controlled flow',
    ],
    responsibilities: [
      {
        area: 'Programme configuration',
        firestore: [
          'programmeConfig',
          'siteContent',
          'financeTemplates',
          'shopUsers/{uid}/transactions',
          'cohorts/{cohortId}/deliverySlotClaims',
          'cohorts/{cohortId}/deliverySlotAvailability',
        ],
        functions: ['saveCohortConfig', 'saveFinanceTemplate', 'resyncDeliverySlotAvailability'],
        adminActions: [
          'Change group target size',
          'Set per-member pricing by delivery slot',
          'Update occupancy options',
          'Review member transaction history',
          'Inspect slot claim state before publishing finance changes',
          'Publish new admin banner or notice',
        ],
      },
    ],
  },
  {
    key: 'audit',
    title: 'Audit Log',
    summary:
      'Track sensitive admin operations so approvals, broadcast changes, and membership edits all leave evidence before live backend rollout.',
    status: 'Audit-first posture',
    queueLabel: 'Sensitive actions',
    queueValue: '128',
    primaryAction: 'Inspect audit trail',
    recordsLabel: 'Recent critical events',
    tableHeaders: ['Event', 'Actor', 'Outcome'],
    tableRows: [
      {
        primary: 'Application approved',
        secondary: 'Platform Admin',
        middle: 'Akosua Mensah unlocked for groups',
        trailing: 'Audit entry written',
        trailingMeta: '2026-08-13 08:42',
      },
      {
        primary: 'Broadcast archived',
        secondary: 'SHOP Ops Lead',
        middle: 'Draft broadcast removed from guest feed',
        trailing: 'Visibility revoked',
        trailingMeta: '2026-08-13 07:11',
      },
      {
        primary: 'Member access suspended',
        secondary: 'Platform Admin',
        middle: 'Fraud review state applied',
        trailing: 'Auth and profile flags updated',
        trailingMeta: '2026-08-12 18:09',
      },
    ],
    quickActions: [
      'Trace every sensitive admin action',
      'Inspect who changed a record and when',
      'Prepare export-ready audit evidence',
    ],
    responsibilities: [
      {
        area: 'Audit trail',
        firestore: ['auditLogs'],
        functions: ['writeAuditEntry'],
        adminActions: [
          'Review admin action history',
          'Trace who changed a record',
          'Export a review trail',
        ],
      },
    ],
  },
];

export const adminPlatformPrinciples = [
  'The admin should trigger business actions, not edit raw Firebase internals directly.',
  'Sensitive actions should move through Cloud Functions so role checks and audit entries stay consistent.',
  'Firestore stores the operational record, while Auth, Storage, and Functions handle identity, documents, and privileged workflows.',
];
