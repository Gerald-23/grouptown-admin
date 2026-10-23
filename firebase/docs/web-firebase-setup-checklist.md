# GroupTown Web Firebase Setup Checklist

Use this after the main pages are built and you are ready to switch the web app from fallback content to live Firebase-backed data.

## Goal

Connect the Next.js web app in `grouptown-web` to a real Firebase project so these pages can use live data:

- `/`
- `/programmes`
- `/programmes/shop`

## 1. Create or choose the Firebase project

In Firebase Console:

- create the GroupTown Firebase project, or
- use an existing approved project

Then:

- add a `Web App` to that Firebase project

## 2. Add the Firebase web config to the Next.js app

Inside `grouptown-web`:

- create `.env.local`
- copy the variable names from [.env.example](C:/Users/lenovo/Desktop/grouptown%20App/grouptown-web/.env.example)
- paste the real values from Firebase Console

Expected variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

## 3. Enable the Firebase products the app expects

Minimum setup:

- Authentication
- Firestore Database
- Storage

Recommended first auth provider:

- Email/Password

## 4. Add the Firestore data used by the current pages

The current web app can render fallback content without Firebase, but live Firebase content requires actual Firestore records.

Current collections expected by the app:

- `programmes`
- `properties`
- `faqs`

## 5. Minimum records needed first

At minimum, add:

- one `programmes` document with `slug = "shop"`
- one `programmes` document with `slug = "slop"`
- `faqs` documents where `category = "programmes"`
- `faqs` documents where `category = "shop"`

## 6. Important behavior to remember

- if `.env.local` is missing or invalid, the app uses fallback content
- if `.env.local` is valid but Firestore is empty, the app still uses fallback content
- Firebase only fully takes effect when both config and data are present

## 7. Best time to do this

Do this after the key pages are built, especially:

- landing page
- programmes page
- S.H.O.P. page
- S.L.O.P. page
- properties page
- auth pages

## 8. After setup is complete

Once Firebase is ready, the next steps are:

1. define the exact Firestore documents for `programmes`, `properties`, and `faqs`
2. add Firebase rules
3. connect auth flows to Firebase Authentication
4. replace remaining placeholder pages with live data-backed pages
