# Asahi School Shuji Schedule

Next.js 15 App Router application for managing schedules, students, announcements, and lesson swap requests for a calligraphy school.

The app continues to use Firebase Authentication, Firestore, and Firebase Admin SDK. The current deployment-readiness work is about removing Firebase Studio-only assumptions so the project can be developed locally, stored on GitHub, and deployed to Vercel.

## Documentation

- Project handoff and data model: [docs/HANDOVER.md](./docs/HANDOVER.md)
- Design system: [DESIGN.md](./DESIGN.md)
- AI handoff report: [AI_WORK_REPORT.md](./AI_WORK_REPORT.md)

## Local Development

Install dependencies:

```bash
npm install
```

Create local environment variables:

```bash
cp .env.example .env.local
```

Fill `.env.local` with values from Firebase project settings and a Firebase Admin service account JSON value when server-side API routes are needed.

Start the dev server:

```bash
npm run dev
```

The dev server uses port `9002` by default.

Run checks:

```bash
npm run typecheck
npm run build
```

## Environment Variables

Set these in `.env.local` for local development and in Vercel Project Settings for Preview/Production deployments.

Public Firebase Web SDK variables:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

Server-only Firebase Admin SDK variable:

```bash
FIREBASE_SERVICE_ACCOUNT_KEY=
```

`FIREBASE_SERVICE_ACCOUNT_KEY` must contain the Firebase service-account JSON string. It is required for server-side API routes that verify ID tokens or use the Admin SDK.

Never commit `.env`, `.env.local`, service-account JSON files, private keys, or actual secret values to GitHub.

## Vercel Deployment

1. Push the repository to GitHub.
2. Import the GitHub repository into Vercel.
3. Use the default Next.js framework detection.
4. Set all environment variables listed above in Vercel Project Settings.
5. Deploy a Preview build.
6. Verify login, student pages, admin pages, and API routes that depend on Firebase Admin SDK.

Notes:

- Do not force Edge runtime for Firebase Admin SDK routes. Firebase Admin SDK expects a Node.js runtime.
- `NEXT_PUBLIC_*` values are intentionally available to the browser.
- `FIREBASE_SERVICE_ACCOUNT_KEY` is server-only and must not be exposed through `next.config.ts` `env` or client code.

## Firebase Studio / App Hosting Files

This repository still keeps Firebase Studio / Firebase App Hosting files such as:

- `apphosting.yaml`
- `docs/backend.json`

They are retained for compatibility and reference. Vercel deployment does not require deleting them.

## Git Safety

Before committing, check:

```bash
git status
```

The `.gitignore` is configured to ignore local env files and common Firebase service-account JSON filename patterns.
