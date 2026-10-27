# GroupTown Privacy Policy

**Effective date:** 27 October 2026  
**Operator:** GroupTown / Sedan Landbank  
**Privacy contact:** `[REPLACE WITH YOUR PUBLIC PRIVACY EMAIL]`

GroupTown is a housing and property group-ownership platform. This Privacy Policy explains what information we collect, why we use it, the service providers that process it, and the choices available to members.

## Information we collect

### Account and identity information

When an account is created, we may collect first name, last name, email address, Firebase account identifier, authentication provider, and account timestamps. If Google sign-in is used, Google supplies the basic account identity information that the member authorises us to receive.

### Registration and eligibility information

When a member completes registration, we may collect date of birth, telephone number, WhatsApp number, digital address, employer, job title, next-of-kin details, housing preferences, preferred location, payment term, group-size choice, affordability information, salary/budget/deposit figures, and other information submitted in the registration or waiting-interest forms. The date-of-birth check is used to enforce the 18+ eligibility rule.

### Housing, group, and community information

We collect interests viewed or selected, group applications, group memberships, group messages, community posts, comments, reactions, support tickets, notifications, and documents or other content submitted by a member. Content shared in a group is visible to the relevant group members; content shared in the wider Community feed may be visible to other GroupTown members according to the app’s access controls.

### Media and documents

If a member chooses to upload content, GroupTown processes the selected photos, videos, and documents and stores them in Firebase Storage. Media-library and document-picker permissions are used only to allow the member to choose files for upload. The app does not access the entire photo library without the relevant device permission.

### Payment information

When a member starts a contribution, the app sends the authenticated user and payment amount to our secure Firebase backend. The backend creates a pending transaction and opens Hubtel checkout. We store the transaction reference, amount, currency, status, selected payment type, payment callback identifiers, and limited callback phone information returned by Hubtel. Card, bank, mobile-money, or other payment credentials are entered on Hubtel’s payment page and are not stored by GroupTown.

### Device, notification, and diagnostics information

If notifications are allowed, the app stores an Expo push-token record so that Firebase Functions can send account, group, community, support, and payment alerts. We may collect device/app information and crash or diagnostic information through Sentry to investigate failures and improve stability. We do not use this information for advertising or sell it.

## How we use information

We use information to:

- create and secure accounts;
- verify age and registration eligibility;
- display homes, interests, programmes, groups, and finance records;
- process group applications and group membership actions;
- process and reconcile Hubtel payments;
- deliver welcome emails, notifications, support responses, and service messages;
- provide community, group chat, comments, reactions, and document features;
- prevent fraud, abuse, unauthorised access, and duplicate or invalid actions;
- maintain audit, security, troubleshooting, and compliance records; and
- improve reliability and user experience.

## Service providers and sharing

We use service providers as necessary to operate GroupTown:

- **Google Firebase / Google Cloud:** Authentication, Firestore database, Cloud Functions, Cloud Storage, email-trigger processing, and related infrastructure.
- **Google Sign-In:** optional authentication provider when a member chooses Google sign-in.
- **Hubtel:** hosted payment checkout and payment-status callbacks.
- **Expo notification service:** delivery of push notifications when a member grants notification permission.
- **Sentry:** crash and diagnostic monitoring.

We do not sell personal information. We share information with service providers only for the purposes described above, with administrators when required to operate programmes and support members, or when required by law, court order, fraud prevention, or protection of rights and safety.

## Security

Data is transmitted over encrypted HTTPS/TLS connections where supported by the service. Firebase access is protected by authentication, Firestore/Storage rules, server-side role checks, and backend functions. Hubtel API credentials are kept in the Firebase Functions runtime and are not included in the mobile app. No internet service can guarantee absolute security, so members should protect their passwords and report suspicious activity promptly.

## Retention

We retain account, registration, group, support, notification, audit, and payment records for as long as reasonably necessary to operate the service, satisfy legal/accounting obligations, resolve disputes, prevent abuse, and maintain programme records. Uploaded content may remain until the member or an authorised administrator removes it, subject to group, audit, legal, and backup retention requirements.

## Your choices and rights

Members may update available profile and registration information, manage notification preferences, sign out, and request correction or deletion by contacting `[REPLACE WITH YOUR PUBLIC PRIVACY EMAIL]`. A deletion request may require identity verification. Some information may need to be retained where required for payment reconciliation, legal obligations, fraud prevention, dispute handling, or programme records. See `ACCOUNT_DELETION.md` before declaring the final deletion process in Play Console.

## Children

GroupTown is not directed to children. Registration and participation are restricted to people aged 18 or older. We do not knowingly create accounts for children. If you believe a child has provided information, contact `[REPLACE WITH YOUR PUBLIC PRIVACY EMAIL]`.

## Changes

We may update this Policy when the app, service providers, or legal requirements change. The revised version will show a new effective date and be published at the same public URL.

## Contact

For privacy questions, correction requests, or deletion requests:  
`[REPLACE WITH YOUR PUBLIC PRIVACY EMAIL]`
