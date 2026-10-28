# Account deletion requirement

GroupTown creates user accounts, so Google Play requires a clear account-deletion option. The current app provides sign-out but does **not** yet provide a complete self-service account-deletion flow.

Before production submission, choose and implement one of these options:

1. Add an in-app **Delete account** action in Profile/Settings that re-authenticates the member, deletes or anonymises the Firebase Auth account and associated member data, and explains records that must be retained; or
2. Publish the prepared public web page at `https://[YOUR DOMAIN]/legal/account-deletion` (or the equivalent cPanel URL) and keep the email process working for members who cannot open the app.

The request process must explain identity verification, expected timing, data that is deleted, and data retained for payment, legal, security, audit, or dispute purposes. Do not claim “users can delete their data” in Play Console until this process is live and tested.

Suggested public wording:

> To request deletion of your GroupTown account, email `sedanlandbank26@gmail.com` from the email address registered to your account with the subject “GroupTown account deletion”. We will verify the request, disable the account while it is processed, delete or anonymise data that is not required for legal, payment, fraud-prevention, audit, or dispute purposes, and confirm completion. Some transaction and programme records may be retained where required by law or legitimate operational obligations.
