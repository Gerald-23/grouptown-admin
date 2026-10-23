# Grouptown Web

Next.js web client for the Grouptown product.

## Stack

- Next.js App Router
- React
- Firebase Web SDK

## Run locally

1. Install dependencies with `npm install`
2. Copy `.env.example` to `.env.local`
3. Fill in the Firebase web app values
4. Start with `npm run dev`

## Admin hardening

- Use `/admin/login` for admin access.
- `/admin` now expects a real Firebase-backed admin session.
- Local/demo auth fallback is not accepted on the admin route.
- If Firebase web env vars are missing, the admin console stays blocked instead of faking a local session.

## Hosting preparation

Before hosting `grouptown-web`, make sure:

1. The deployment target has the `NEXT_PUBLIC_FIREBASE_*` env vars from `.env.example`.
2. The hosted site uses the same Firebase project as the mobile app build you are testing.
3. Admin users have `role: admin` or `role: superadmin` in `shopUsers/{uid}`.
4. Public hosting is treated separately from local `npm run dev`; the live admin should be opened through the hosted URL, not a local server.

## Current admin limitation

Sensitive admin writes are still client-driven in this checkout because the Functions migration is intentionally deferred for now. That is acceptable for internal buildout, but it is still below the final production target.

## Structure

- `src/app` app routes and layouts
- `src/components` reusable UI
- `src/lib/firebase` Firebase client helpers

This project is intended to share the same Firebase backend as the mobile app.
