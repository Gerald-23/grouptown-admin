# GroupTown welcome email via Firebase Trigger Email

The `onShopUserCreated` Cloud Function writes one welcome-email job to the
top-level `mail` collection when a new `shopUsers/{uid}` document is created.

Install Firebase's **Trigger Email** extension in the same Firebase project and
configure it to watch the `mail` collection. Configure the extension with the
project's approved SMTP sender and set its allowed sender address. The extension
must be installed before deploying the Cloud Function for welcome emails to be
delivered.

The job format uses the extension's standard fields:

- `to`: recipient email list
- `message.subject`: `Welcome to GroupTown, {firstName}`
- `message.text`: plain-text welcome message
- `metadata.type`: `welcome`

Do not grant the mobile app direct write access to the `mail` collection. The
server function is the only component that creates these jobs.
