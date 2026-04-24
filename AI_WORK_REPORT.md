# AI Work Report

## 1. Summary

This session started from the handoff documents and focused first on the `/admin/*` access-control gap identified in `HANDOVER.md`.

Phase 1 was implemented with a minimal change to `src/app/(main)/admin/layout.tsx`: the admin layout is now a client component that checks Firebase Auth state and Firestore `users/{uid}.role` before rendering admin pages.

Phase 2 was started, but stopped before implementation because `next.config.ts` currently exposes `FIREBASE_SERVICE_ACCOUNT_KEY` through the Next.js `env` config. That is a secret exposure risk and should be fixed before continuing Vercel deployment preparation.

Phase 3 was not started.

## 2. Completed Phases

- Phase 1: adminアクセス制御

Not completed:

- Phase 2: Vercelデプロイ準備
- Phase 3: DESIGN.md共通テーマ反映
- Phase 4: 最終レポート

## 3. Changed Files

- `src/app/(main)/admin/layout.tsx`
  - Converted the admin layout to a client component.
  - Added `useUser()` and `useFirestore()` based role checking.
  - Shows `<Loading />` while auth/user-role checks are pending.
  - Redirects unauthenticated users to `/login`.
  - Redirects users without `users/{uid}` to `/login`.
  - Allows rendering only when `users/{uid}.role === "admin"`.
  - Redirects non-admin users, including students, to `/student`.

- `AI_WORK_REPORT.md`
  - Added this handoff report for the next AI agent.

Existing uncommitted file from earlier work:

- `docs/DESIGN.md`
  - Design-system document saved under `docs`.
  - It is currently untracked and was not included in the Phase 1 commit.

## 4. Commits

- `067207f` - `Protect admin routes with role check`

This report should be committed separately with:

- `Add AI work report for handoff`

## 5. Verification Results

### `npm run typecheck`

Result: failed.

Command output showed existing TypeScript errors unrelated to the admin-layout guard:

- `src/app/(main)/admin/schedule/page.tsx`: imports `AppSettings` from `@/lib/data`, but `data.ts` does not export it.
- `src/app/(main)/student/announcements/page.tsx`: imports missing `getPublishedAnnouncements`.
- `src/app/(main)/student/page.tsx`: imports missing `getPublishedAnnouncements`.
- `src/app/(main)/student/swap/new/page.tsx`: imports missing `createSwapRequest`.
- `src/components/student/MoveLessonDialog.tsx`: imports missing `getAvailableSlotsForMove` and `moveLessonToSlotWithToken`.
- `src/components/ui/calendar.tsx`: `react-day-picker` component override types do not match current package types.
- `src/app/api/available-slots/route.ts` and `src/app/api/move-lesson/route.ts`: Firestore Admin SDK `exists` is being called like a function in places where the type is a boolean.
- `src/app/api/move-lesson/route.ts`: `adminDb` is possibly `null`.

Likely cause:

- The repository already had incomplete or mismatched TypeScript surfaces before this session. The Phase 1 change did not introduce the listed missing exports or API route type issues.

Next action:

- Fix missing `data.ts` exports and current TypeScript errors in a dedicated stabilization phase.
- Avoid changing API route Admin SDK behavior unless explicitly requested, because current instructions said not to change API route verification.

### `npm run build`

Result: failed.

The current script is:

```bash
NODE_ENV=production next build
```

On Windows PowerShell / cmd this fails with:

```text
'NODE_ENV' is not recognized as an internal or external command
```

Likely cause:

- The build script uses POSIX-style environment variable syntax.

Next action:

- For cross-platform local builds, either use `cross-env NODE_ENV=production next build`, or remove the explicit `NODE_ENV=production` because `next build` already runs a production build.
- This was not changed in this session because Phase 2 was stopped due to the `FIREBASE_SERVICE_ACCOUNT_KEY` exposure risk in `next.config.ts`.

## 6. Manual Check Steps

Run the app locally after dependencies are installed:

```bash
npm run dev
```

Then check:

1. 未ログインで `/admin` にアクセス
   - Expected: redirect to `/login`.
   - Admin layout should not render.

2. studentユーザーで `/admin` にアクセス
   - Sign in with a user whose Firestore document has `role: "student"`.
   - Open `/admin`.
   - Expected: redirect to `/student`.

3. adminユーザーで `/admin` にアクセス
   - Sign in with a user whose Firestore document has `role: "admin"`.
   - Open `/admin`.
   - Expected: admin layout renders normally.

4. `/student` の既存動作
   - Unauthenticated users should still redirect to `/login`.
   - Linked student users should access `/student`.
   - Unlinked student users should still redirect to `/link-account`.

5. トップページやログイン画面の表示崩れ有無
   - Open `/`.
   - Confirm it redirects based on role/link status as before.
   - Open `/login`.
   - Confirm the login screen still renders.

## 7. Remaining Risks

- The admin layout guard is client-side protection, not complete server-side authorization.
- Firestore Rules still need to be reviewed to ensure students cannot read/write admin-only data directly.
- API routes still need their existing Admin SDK verification reviewed separately, but this session intentionally did not modify them.
- Vercel production requires all environment variables to be configured correctly.
- `FIREBASE_SERVICE_ACCOUNT_KEY` must not be exposed through `next.config.ts` `env`.
- Firebase Admin SDK behavior on Vercel Node.js runtime still needs production or preview verification.
- `npm run typecheck` currently fails due to existing repository errors.
- `npm run build` currently fails on Windows because of POSIX-style `NODE_ENV=production` syntax.
- `docs/DESIGN.md` is currently untracked unless a later commit adds it.

## 8. Next Recommended Tasks

1. Fix the `FIREBASE_SERVICE_ACCOUNT_KEY` exposure risk by removing it from `next.config.ts` `env`, while keeping server-side `process.env.FIREBASE_SERVICE_ACCOUNT_KEY` usage.
2. Complete Phase 2: add `.env.example`, document Vercel deployment steps, and explain Firebase Studio/App Hosting differences.
3. Fix current TypeScript errors so `npm run typecheck` passes.
4. Make the build script cross-platform or document that build verification should run in a POSIX shell/CI.
5. Review Firestore Rules for admin/student separation.
6. Verify Firebase Admin SDK route handlers on Vercel Preview with real environment variables.
7. Complete Phase 3 by applying `DESIGN.md` tokens to shared theme files only.
8. Later, apply the design system gradually to top page, admin screens, and student screens.
9. Add mobile polish for monthly scheduler.
10. Build a Genkit auto-scheduling MVP after access control and deployment are stable.

## 9. Handoff Prompt for Next AI

You are continuing work on `S:\Asahi-school-shuji`, a Next.js 15 App Router + Firebase Authentication + Firestore app for a calligraphy school schedule-management system.

Read these first:

- `docs/HANDOVER.md`
- `docs/DESIGN.md`
- `AI_WORK_REPORT.md`

Completed:

- Phase 1 admin route access control was implemented in `src/app/(main)/admin/layout.tsx`.
- Commit: `067207f Protect admin routes with role check`.
- The admin layout now checks Firebase Auth and Firestore `users/{uid}.role`.
- Only `role === "admin"` can render `/admin/*`.
- Unauthenticated users and users without `users/{uid}` redirect to `/login`.
- Non-admin users redirect to `/student`.

Current state:

- Phase 2 was started but stopped before file changes because `next.config.ts` contains:
  - `env: { FIREBASE_SERVICE_ACCOUNT_KEY: process.env.FIREBASE_SERVICE_ACCOUNT_KEY }`
- This is a secret exposure risk in Next.js and should be removed before continuing Vercel deployment work.
- Do not commit secret values.
- Environment variable names are allowed; values are not.
- `docs/DESIGN.md` exists but is currently untracked.

Verification:

- `npm run typecheck` fails due to existing TypeScript errors unrelated to the admin layout change.
- `npm run build` fails on Windows because the script uses `NODE_ENV=production next build`.

Next task:

Continue Phase 2 after addressing the secret exposure risk:

1. Remove `FIREBASE_SERVICE_ACCOUNT_KEY` from `next.config.ts` `env`.
2. Keep Firebase Admin SDK reading `process.env.FIREBASE_SERVICE_ACCOUNT_KEY` server-side.
3. Add `.env.example` with only variable names/placeholders.
4. Update `README.md` with local development, required environment variables, Vercel deployment steps, Firebase Studio/App Hosting differences, and Firebase Admin SDK Node.js runtime notes.
5. Do not delete `apphosting.yaml` or `docs/backend.json`.
6. Do not change API routes' Admin SDK verification logic unless explicitly requested.
7. Run `npm run typecheck` and `npm run build`; document failures if existing errors remain.
8. Commit small changes by phase.

