# Shared Architecture

Grouptown uses one Firebase backend for two clients:

- React Native mobile app
- Next.js web app

Guiding rule:

Both clients must use the same auth model, Firestore schema, and storage path rules.

Use Cloud Functions when:

- a workflow needs admin privileges
- a rule would be too complex to enforce only in the client
- an action must be audited or validated on the server
