# Final Play Console checklist

## App content

- [ ] Public HTTPS privacy-policy URL is live and matches `PRIVACY_POLICY.md`.
- [ ] Account-deletion request or in-app deletion flow is live and tested.
- [ ] Dedicated reviewer account and instructions are added.
- [ ] Ads declaration is set to No.
- [ ] Content rating questionnaire is completed.
- [ ] Target audience is set to adults/18+.
- [ ] Data Safety answers match the production build and vendors.
- [ ] Government app declaration is No.
- [ ] Financial features declaration includes mobile/digital payments.
- [ ] Health declaration is No.
- [ ] Category and developer contact details are complete.

## Store listing

- [ ] App name, short description, full description, icon, feature graphic, and screenshots are complete.
- [ ] Screenshots contain no personal data, credentials, API keys, or unapproved prices.
- [ ] Privacy, support, and website links work on a public browser.

## Technical release

- [ ] Production Android package is `com.gerald2307.grouptownapp`.
- [ ] Release is signed through EAS/Play App Signing.
- [ ] Firebase Functions and Firestore/Storage rules are deployed.
- [ ] Hubtel production secrets are set only in Firebase Functions runtime.
- [ ] Hubtel callback, success, cancellation, and logo URLs are HTTPS and reachable.
- [ ] Trigger Email extension is configured and welcome/reset emails are tested.
- [ ] Media uploads work in the release build and low-memory devices do not crash.
- [ ] Sentry release is configured and no unresolved fatal crash blocks release.

## Production access

- [ ] Closed test is started.
- [ ] At least 12 testers are continuously opted in for 14 days.
- [ ] Tester feedback and crash evidence are recorded.
- [ ] Production-access questions are answered consistently with the documents in this folder.
