# SHOP Admin Firebase Responsibility Map

This admin web app should manage the platform through business actions, not raw Firebase internals.

## Admin modules

- `/admin`
  - Overview dashboard for platform posture and queue health
- `/admin/applications`
  - Review SHOP applications and control eligibility
- `/admin/broadcasts`
  - Moderate guest-facing interest broadcasts
- `/admin/groups`
  - Manage 12-member circle formation and waiting-room flow
- `/admin/members`
  - Inspect member identity, eligibility, and account state
- `/admin/settings`
  - Edit programme configuration and admin notices
- `/admin/audit`
  - Review sensitive action history

## Firebase handling model

### Firestore owns

- `profiles`
- `applications`
- `programmeEligibility`
- `cohorts`
- `groupCategories`
- `broadcasts`
- `groups`
- `memberships`
- `programmeConfig`
- `siteContent`
- `auditLogs`

### Firebase Auth owns

- user enable/disable state
- role claim state
- password reset / account recovery orchestration

### Storage owns

- application document uploads
- verification files
- generated certificates or supporting PDFs

### Cloud Functions own

- `approveApplication`
- `rejectApplication`
- `requestApplicationCorrection`
- `publishBroadcast`
- `archiveBroadcast`
- `featureBroadcast`
- `assignMemberToGroup`
- `removeMemberFromGroup`
- `lockGroupCircle`
- `saveCohortConfig`
- `suspendMemberAccess`
- `restoreMemberAccess`
- `setMemberRole`
- `publishProgrammeConfig`
- `writeAuditEntry`

## Design rule

The admin panel should expose platform actions such as:

- Approve application
- Reject with reason
- Publish broadcast
- Lock group
- Edit cohort details
- Suspend member
- Update programme setting

The panel should not present these as direct database operations. Each sensitive action should flow through a secured backend function that:

1. validates admin privileges
2. updates the correct Firebase records
3. writes an audit entry
4. triggers follow-up side effects when needed
