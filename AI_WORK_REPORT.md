# AI Work Report

## 1. Summary

This repository is a Next.js 15 App Router application for Asahi calligraphy school scheduling. It uses Firebase Authentication, Firestore, shadcn/ui, Tailwind CSS, and Firebase Admin SDK route handlers.

This work continued from the admin access-control phase and completed UI-focused Phases 4-7:

- Improved the top redirect/loading page and login screen using the DESIGN.md direction.
- Improved the admin dashboard so teachers can reach today's operations and major admin workflows quickly.
- Improved the student dashboard so students/parents can understand next lesson, lesson list, announcements, and rescheduling entry points.
- Improved mobile usability for monthly schedule and monthly assignment screens without changing Firestore structure or scheduling logic.

The work intentionally did not change Firebase/Auth/Firestore structure, API route Admin SDK verification, or secret handling.

## 2. Completed Phases

- Phase 1: adminアクセス制御
- Phase 4: トップページ改善
- Phase 5: 管理者ダッシュボード改善
- Phase 6: 生徒ダッシュボード改善
- Phase 7: 月間スケジュールのモバイル対応改善

Not completed:

- Phase 2: Vercelデプロイ準備
- Phase 3: DESIGN.md共通テーマ反映

## 3. Changed Files

- `DESIGN.md`
  - Promoted the rescued design-system document to the project root.
  - This is the canonical design-system source.

- `src/app/(main)/admin/layout.tsx`
  - Converted admin layout to a client component.
  - Added Firebase Auth and Firestore `users/{uid}.role` check.
  - Redirects unauthenticated users and missing user docs to `/login`.
  - Redirects non-admin users to `/student`.

- `src/app/page.tsx`
  - Kept existing auth redirect logic.
  - Replaced plain loading state with a calmer DESIGN.md-aligned redirect screen.

- `src/app/(auth)/login/page.tsx`
  - Kept Firebase email/password login behavior.
  - Reworked layout and copy into a clearer calligraphy-school login screen.
  - Fixed visible mojibake in login labels and messages.

- `src/app/(main)/admin/page.tsx`
  - Rebuilt dashboard copy and cards.
  - Added priority actions for today's operations and monthly assignment.
  - Added quick links for student management, monthly schedule, swaps, and announcements.

- `src/app/(main)/student/page.tsx`
  - Reworked dashboard around next lesson first.
  - Added clearer lesson-list and rescheduling guidance.
  - Replaced the dashboard import of missing `getPublishedAnnouncements` with `getAllAnnouncements` plus local published filtering.

- `src/app/(main)/admin/schedule/page.tsx`
  - Moved `AppSettings` import to `@/lib/types`, removing one existing typecheck error.
  - Added mobile day cards for schedule review and slot editing.
  - Kept the existing desktop horizontal schedule grid.

- `src/app/(main)/admin/monthly-scheduler/page.tsx`
  - Adjusted student pool and date bucket layout for mobile.
  - Added selected-student guidance banner.
  - Made slot dialog scrollable on small screens.

- `AI_WORK_REPORT.md`
  - Updated this handoff report.

## 4. Commits

- `067207f` - `Protect admin routes with role check`
- `4133577` - `Add AI work report for handoff`
- `5abf496` - `Promote design system document to root`
- `57e6dab` - `Improve top and login pages with DESIGN.md`
- `bc3bbad` - `Improve admin dashboard usability`
- `ee2fb10` - `Improve student dashboard clarity`
- `2843834` - `Improve monthly schedule mobile usability`

## 5. Verification Results

### `npm run typecheck`

Result: failed.

Last run after Phase 7 still fails with existing repository errors:

- `src/app/(main)/student/announcements/page.tsx`
  - Imports missing `getPublishedAnnouncements` from `@/lib/data`.
  - Has an implicit `any` parameter.
- `src/app/(main)/student/swap/new/page.tsx`
  - Imports missing `createSwapRequest`.
- `src/app/api/available-slots/route.ts`
  - Calls Firestore Admin `exists` as a function where the type is boolean.
- `src/app/api/move-lesson/route.ts`
  - `adminDb` is possibly `null`.
  - Calls Firestore Admin `exists` as a function where the type is boolean.
- `src/components/student/MoveLessonDialog.tsx`
  - Imports missing `getAvailableSlotsForMove`.
  - Imports missing `moveLessonToSlotWithToken`.
- `src/components/ui/calendar.tsx`
  - `IconLeft` / related component override types do not match the installed `react-day-picker` types.

Notes:

- Earlier errors in `src/app/(main)/admin/schedule/page.tsx` and `src/app/(main)/student/page.tsx` were reduced by scoped changes during Phases 6 and 7.
- Remaining errors are outside the Phase 4-7 dashboard/mobile UI scope, except the student dashboard import that was fixed.

### `npm run build`

Result: failed.

The script still fails on Windows PowerShell/cmd before Next.js starts:

```text
'NODE_ENV' is not recognized as an internal or external command
```

Cause:

- `package.json` uses POSIX-style syntax:

```bash
NODE_ENV=production next build
```

Next recommended fix:

- Either remove the explicit `NODE_ENV=production` from `build`, or use `cross-env NODE_ENV=production next build`.
- This was not changed because the requested phases were UI-focused and there is still a separate Phase 2 deployment-prep task.

## 6. Manual Check Steps

Run locally after installing dependencies:

```bash
npm run dev
```

Check these flows in a browser:

1. Top page and login
   - Open `/`.
   - Confirm the redirect/loading screen appears briefly and routes based on auth/user role.
   - Open `/login`.
   - Confirm Japanese labels render correctly and layout works on desktop/mobile.
   - Attempt login with valid credentials and confirm redirect to `/`.

2. Admin access control
   - Unauthenticated user opens `/admin`: should redirect to `/login`.
   - Student user opens `/admin`: should redirect to `/student`.
   - Admin user opens `/admin`: should see the admin dashboard.

3. Admin dashboard
   - Open `/admin` as admin.
   - Confirm cards link to:
     - `/admin/today`
     - `/admin/monthly-scheduler`
     - `/admin/students`
     - `/admin/schedule`
     - `/admin/swaps`
     - `/admin/announcements`

4. Student dashboard
   - Open `/student` as a linked student user.
   - Confirm next lesson appears first when data exists.
   - Confirm lesson list and announcement links navigate correctly.
   - Confirm unlinked student behavior still comes from `student/layout.tsx` and redirects to `/link-account`.

5. Monthly schedule mobile
   - Open `/admin/schedule` on a mobile viewport.
   - Confirm day cards appear instead of relying only on horizontal grid.
   - Tap a time slot and confirm the existing edit dialog opens.
   - Check desktop viewport still shows the existing horizontal grid.

6. Monthly assignment mobile
   - Open `/admin/monthly-scheduler` on a mobile viewport.
   - Select a student, then select a date.
   - Confirm the selected-student banner appears and the existing assignment behavior still works.
   - Open a date without selecting a student and confirm the slot dialog remains usable.

## 7. Remaining Risks

- Admin layout protection is client-side. Firestore Rules must still enforce admin/student data separation.
- API route Admin SDK verification was intentionally not changed.
- `next.config.ts` still contains a known secret-exposure risk if `FIREBASE_SERVICE_ACCOUNT_KEY` is configured through `env`; remove it in Phase 2 before Vercel deployment preparation.
- Vercel production requires environment variables to be configured by name only, never committed with values:
  - `NEXT_PUBLIC_FIREBASE_API_KEY`
  - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - `NEXT_PUBLIC_FIREBASE_APP_ID`
  - `FIREBASE_SERVICE_ACCOUNT_KEY`
- `npm run typecheck` still fails due to existing missing exports and type mismatches.
- `npm run build` still fails on Windows because of the build script.
- Several files still contain mojibake outside the pages touched in these phases.
- Browser verification was not completed because the requested validation commands already fail and there are known compile/type issues to stabilize first.

## 8. Next Recommended Tasks

1. Phase 2: remove `FIREBASE_SERVICE_ACCOUNT_KEY` from `next.config.ts` `env`, add `.env.example`, and document Vercel deployment.
2. Fix typecheck errors in a dedicated stabilization pass:
   - Add or replace missing `data.ts` exports.
   - Fix `react-day-picker` component override types.
   - Fix Admin SDK `exists` boolean calls and nullable `adminDb` types without changing route behavior.
3. Make `npm run build` cross-platform.
4. Review Firestore Rules for admin/student separation.
5. Complete Phase 3 by applying `DESIGN.md` tokens to shared theme files.
6. Clean remaining mojibake in sidebar, headers, lesson list, announcements, swap, and dialog screens.
7. Run browser verification for desktop/mobile after typecheck/build are stable.
8. Prepare a Vercel Preview Deploy and verify Firebase Admin SDK on Node.js runtime.
9. Improve monthly scheduler interaction copy and empty states after compile stabilization.
10. Begin Genkit auto-scheduling MVP only after access control, rules, and deployment are stable.

## 9. Handoff Prompt for Next AI

You are continuing work on `S:\Asahi-school-shuji`, a Next.js 15 App Router + Firebase Authentication + Firestore app for a calligraphy school scheduling system.

Read first:

- `docs/HANDOVER.md`
- `DESIGN.md`
- `AI_WORK_REPORT.md`

Completed work:

- Admin route client-side role guard is implemented in `src/app/(main)/admin/layout.tsx`.
- Root `DESIGN.md` is the canonical design-system document.
- Top redirect page and login page were improved.
- Admin dashboard was improved.
- Student dashboard was improved.
- Monthly schedule and monthly scheduler received mobile usability improvements.

Important constraints:

- Do not commit secret values.
- Do not expose `FIREBASE_SERVICE_ACCOUNT_KEY` to the client.
- Do not make major Firebase/Auth/Firestore schema changes without explicit approval.
- Do not change API route Admin SDK verification behavior unless explicitly requested.

Current blockers:

- `npm run typecheck` fails due to existing missing exports/type mismatches.
- `npm run build` fails on Windows because `package.json` uses `NODE_ENV=production next build`.
- `next.config.ts` has a known secret-exposure risk through `env.FIREBASE_SERVICE_ACCOUNT_KEY`.

Recommended next task:

Start Phase 2 / stabilization:

1. Remove `FIREBASE_SERVICE_ACCOUNT_KEY` from `next.config.ts` `env`.
2. Keep server-side code reading `process.env.FIREBASE_SERVICE_ACCOUNT_KEY`.
3. Add `.env.example` with variable names only.
4. Update README for local dev, Vercel env vars, Firebase Studio/App Hosting differences, and Firebase Admin SDK Node.js runtime notes.
5. Fix typecheck errors in small commits.
6. Re-run `npm run typecheck` and `npm run build`.

