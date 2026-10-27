# Closed testing plan

## Release

- Build an Android App Bundle (`.aab`) for Play Console closed testing.
- Use the production Firebase project only after checking rules, Storage, Functions, Hubtel configuration, email delivery, and notification settings.
- Add release notes: `Initial GroupTown closed test covering authentication, registration, interest catalogue, community, groups, finance, notifications, media uploads, and stability.`

## Testers

- Invite at least 15–20 testers so at least 12 remain continuously opted in.
- Each tester must open the opt-in link using the authorised Google account, accept the test, and install GroupTown from Google Play.
- Record the date each tester opted in. Keep at least 12 continuously opted in for 14 full days before requesting production access.

## Test cases

1. Create an account with valid email/password.
2. Test Google sign-in if enabled for the release.
3. Verify the welcome email and email verification flow.
4. Test password reset.
5. Confirm an under-18 date of birth is rejected.
6. Skip onboarding, open Home, then resume registration from Profile.
7. Confirm registration fields persist and populate correctly.
8. Browse the Interest catalogue and open an individual interest.
9. Test affordability filters and group-size/payment-term choices.
10. Test join-group and create-group flows with matching house type/plan.
11. Test Community and private group feeds, comments, reactions, and chat.
12. Upload a small photo, video, and document; test permission denial and retry.
13. Test finance history and Hubtel in sandbox/test mode only.
14. Verify pending, completed, failed, and cancelled payment states without real funds unless approved.
15. Test notifications, notification preferences, back navigation, offline loading, and refresh.
16. Test on low-memory and low-bandwidth Android devices.

## Evidence to keep

Keep tester feedback, crash reports, screenshots of fixes, test dates, device models, and a short summary of changes made during the 14-day test. Google may ask how the test was conducted before granting production access.
