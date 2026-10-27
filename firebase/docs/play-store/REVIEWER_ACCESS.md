# Google Play reviewer access

GroupTown has authenticated screens. Create a dedicated non-admin Firebase test account and provide these values in Play Console under **App content → App access → Add instructions**.

## Values to provide

- **Test email:** `[REPLACE WITH DEDICATED REVIEWER EMAIL]`
- **Test password:** `[REPLACE WITH DEDICATED REVIEWER PASSWORD]`
- **Account role:** ordinary member; do not use an administrator account.
- **Google sign-in:** optional; email/password credentials are more reliable for automated review.

## Reviewer instructions

1. Install and open GroupTown.
2. Tap **Sign in**.
3. Enter the test email and password above.
4. If Firebase asks for verification, use a test account whose email is already verified, or provide the exact verification step.
5. The app opens Home. Use **Interest** to view homes and interest details.
6. Use **Community** to view the public member feed. Use **Profile** to review registration progress and settings.
7. Do not attempt a real payment. If payment testing is required, provide a Hubtel sandbox/test account and instructions separately.

## Reviewer notes

- GroupTown is for adults aged 18 and above.
- Some group and finance screens require a completed registration or an approved/group-assigned test account.
- Media upload requires photo/document permission and a test Firebase Storage configuration.
- No ads are displayed.
- Contact for access problems: `[REPLACE WITH YOUR DEVELOPER SUPPORT EMAIL]`.
