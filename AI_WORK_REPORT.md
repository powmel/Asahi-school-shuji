# AI Work Report

## 1. Summary

This repository is a Next.js 15 App Router application for Asahi calligraphy school scheduling. It uses Firebase Authentication, Firestore, shadcn/ui, Tailwind CSS, and Firebase Admin SDK route handlers.

Phase 8 focused on stabilization and deployment readiness for local development + GitHub + Vercel while continuing to use Firebase Auth, Firestore, and Firebase Admin SDK.

Completed in Phase 8:

- Made the `build` script cross-platform by changing it to `next build`.
- Removed `FIREBASE_SERVICE_ACCOUNT_KEY` from `next.config.ts` `env` so the server secret is not exposed through Next config.
- Fixed TypeScript errors from missing exports, Admin SDK types, and `react-day-picker` v9 component overrides.
- Added `.env.example`.
- Rewrote README deployment and local-development documentation.
- Updated Firebase Web SDK config to read `NEXT_PUBLIC_*` environment variables, with existing Firebase Studio values retained as fallback.

No UI feature work was added in this phase.

## 2. Completed Phases

- Phase 1: admin route access control
- Phase 4: top/login page improvement
- Phase 5: admin dashboard improvement
- Phase 6: student dashboard improvement
- Phase 7: monthly schedule mobile usability
- Phase 8: stabilization / deployment readiness

Not completed:

- Phase 3: full shared theme token application from `DESIGN.md`

## 3. Changed Files

- `package.json`
  - Changed `build` from `NODE_ENV=production next build` to `next build`.
  - No new dependency such as `cross-env` was added because `next build` already runs a production build.

- `next.config.ts`
  - Removed `env.FIREBASE_SERVICE_ACCOUNT_KEY`.
  - This keeps the Firebase Admin SDK service-account JSON server-only via `process.env.FIREBASE_SERVICE_ACCOUNT_KEY`.

- `.env.example`
  - Added public Firebase Web SDK variable names.
  - Added server-only `FIREBASE_SERVICE_ACCOUNT_KEY` placeholder.
  - Contains no secret values.

- `README.md`
  - Rewrote local development instructions.
  - Added environment variable documentation.
  - Added Vercel deployment notes.
  - Documented that Firebase Studio / App Hosting files remain in the repo.
  - Documented that Firebase Auth / Firestore / Firebase Admin SDK remain in use.

- `src/firebase/config.ts`
  - Reads Firebase Web SDK config from `NEXT_PUBLIC_*` env vars.
  - Keeps existing Studio config values as fallback to avoid breaking current local usage.

- `src/lib/data.ts`
  - Added `getPublishedAnnouncements`.
  - Added `createSwapRequest`.
  - Added `getAvailableSlotsForMove`.
  - Added `moveLessonToSlotWithToken`.
  - These fill existing call sites without changing Firestore schema.

- `src/app/api/available-slots/route.ts`
  - Fixed Firebase Admin SDK document snapshot `exists` usage.
  - Narrowed `adminDb` / `adminAuth` through local constants.
  - Did not change route verification behavior.

- `src/app/api/move-lesson/route.ts`
  - Fixed Firebase Admin SDK document snapshot `exists` usage.
  - Narrowed `adminDb` / `adminAuth` through local constants.
  - Did not change route verification behavior.

- `src/components/ui/calendar.tsx`
  - Updated custom navigation icon override from removed `IconLeft` / `IconRight` keys to `Chevron`, matching `react-day-picker` v9.

- `AI_WORK_REPORT.md`
  - Updated this report for Phase 8.

## 4. Commits

- `3fcb66d` - `Fix build script for cross-platform Next.js build`
- `83c628d` - `Fix TypeScript errors for deployment readiness`
- `d289842` - `Add environment example and deployment docs`

Earlier relevant commits:

- `2843834` - `Improve monthly schedule mobile usability`
- `ee2fb10` - `Improve student dashboard clarity`
- `bc3bbad` - `Improve admin dashboard usability`
- `57e6dab` - `Improve top and login pages with DESIGN.md`
- `5abf496` - `Promote design system document to root`
- `067207f` - `Protect admin routes with role check`

## 5. Verification Results

### `npm run typecheck`

Result: passed.

Last run:

```text
> nextn@0.1.0 typecheck
> tsc --noEmit
```

### `npm run build`

Result: failed in the current workspace.

The build script itself is now cross-platform and Next.js starts correctly:

```text
> nextn@0.1.0 build
> next build
```

Current failure:

```text
Error: EISDIR: illegal operation on a directory, readlink 'S:\Asahi-school-shuji\src\app\favicon.ico'
```

Investigation notes:

- `src/app/favicon.ico` is a normal tracked file, not a directory.
- On this `S:` filesystem, Node `fs.readlink()` returns `EISDIR` for normal files.
- Moving the favicon temporarily only caused the same failure to appear on other normal files under `node_modules`, so this is not specific to the favicon file.
- This appears to be an environment/filesystem issue in the current local workspace rather than a TypeScript or app-source failure.

Next recommended verification:

- Run `npm run build` in Vercel Preview or on a normal local NTFS workspace path.
- Keep the current repo changes; do not add webpack-specific workaround config unless the issue reproduces outside this `S:` filesystem.

## 6. Vercel Environment Variables

Set these in Vercel Project Settings before Preview/Production deploy.

Public Firebase Web SDK variables:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

Server-only Firebase Admin SDK variable:

- `FIREBASE_SERVICE_ACCOUNT_KEY`

Rules:

- Do not commit `.env`, `.env.local`, service-account JSON files, private keys, or actual secret values.
- Do not expose `FIREBASE_SERVICE_ACCOUNT_KEY` through `next.config.ts` `env`.
- Firebase Admin SDK route handlers must run on Node.js runtime, not Edge runtime.

## 7. Manual Check Steps

After deploying to Vercel Preview or running locally from a normal filesystem path:

1. Run `npm install`.
2. Set env vars from `.env.example`.
3. Run `npm run typecheck`.
4. Run `npm run build`.
5. Run `npm run dev`.
6. Confirm `/login` renders.
7. Confirm `/` redirects by auth/user role.
8. Confirm unauthenticated `/admin` redirects to `/login`.
9. Confirm student `/admin` redirects to `/student`.
10. Confirm admin `/admin` renders.
11. Confirm student lesson move dialog can load available slots through `/api/available-slots`.
12. Confirm moving a lesson calls `/api/move-lesson` with a Firebase ID token.

## 7.1 Vercel Preview Checklist

Before opening the Preview URL:

- Confirm all variables from `.env.example` are set in Vercel Project Settings.
- Confirm `FIREBASE_SERVICE_ACCOUNT_KEY` is set only as a server-side Vercel environment variable.
- Confirm no `.env`, `.env.local`, service-account JSON file, or private key has been committed.
- Confirm Vercel uses the default Next.js framework preset.
- Confirm Firebase Admin SDK routes are not configured for Edge runtime.

After the Preview build:

- Confirm the Vercel build log reaches `next build` and does not reproduce the local `EISDIR readlink` error.
- If the build fails, inspect the first Vercel build-log error before changing code.
- Open `/login` and confirm the login screen renders.
- Open `/` and confirm it redirects by Firebase Auth state and Firestore role/link status.
- Open `/admin` while signed out and confirm redirect to `/login`.
- Open `/admin` as a student and confirm redirect to `/student`.
- Open `/admin` as an admin and confirm the dashboard renders.
- Open `/student` as a linked student and confirm the student dashboard renders.
- Test a student lesson move flow so `/api/available-slots` and `/api/move-lesson` run with Firebase Admin SDK.
- Check Vercel function logs for Firebase Admin SDK initialization or service-account JSON parse errors.

## 8. Remaining Risks

- Local `npm run build` still fails on the current `S:` workspace because of Node/webpack `readlink` behavior on normal files.
- Firebase Admin SDK behavior still needs Vercel Preview verification with real environment variables.
- Firestore Rules still need a dedicated review for admin/student data separation.
- Admin route protection remains client-side in layout; Firestore Rules and route handlers must remain the real data boundary.
- Several older screens still contain mojibake text.
- README and `.env.example` document env var names only; humans must supply correct Firebase values in Vercel.

## 9. Next Recommended Tasks

1. Push the Phase 8 commits to GitHub.
2. Create a Vercel Preview deployment with the documented environment variables.
3. Verify `npm run build` on Vercel or a normal local NTFS workspace path.
4. Test Firebase Admin SDK routes in Preview.
5. Review and harden Firestore Rules.
6. Clean remaining mojibake in sidebars, lesson pages, announcement pages, and swap pages.
7. Apply `DESIGN.md` tokens to shared theme files as a separate Phase 3-style task.
8. Add smoke tests for auth redirects and key dashboard routes after build is stable.

## 10. Handoff Prompt for Next AI

You are continuing work on `S:\Asahi-school-shuji`, a Next.js 15 App Router + Firebase Authentication + Firestore app for a calligraphy school scheduling system.

Read first:

- `docs/HANDOVER.md`
- `DESIGN.md`
- `AI_WORK_REPORT.md`
- `README.md`

Current state:

- Phase 8 stabilization is mostly complete.
- `npm run typecheck` passes.
- `npm run build` starts correctly but fails in this `S:` workspace due to Node/webpack `readlink` returning `EISDIR` for normal files.
- `next.config.ts` no longer exposes `FIREBASE_SERVICE_ACCOUNT_KEY`.
- `.env.example` and README document Vercel deployment variables.

Important constraints:

- Do not commit secret values.
- Do not expose `FIREBASE_SERVICE_ACCOUNT_KEY` to client code.
- Do not make major Firebase/Auth/Firestore schema changes without approval.
- Do not force Firebase Admin SDK routes to Edge runtime.

Recommended next task:

Push to GitHub, configure Vercel env vars, run a Preview deployment, and verify whether `next build` passes in Vercel's Linux environment. If it passes there, treat the remaining local build failure as a workspace filesystem issue. If it fails there too, investigate the first Vercel build log error.
