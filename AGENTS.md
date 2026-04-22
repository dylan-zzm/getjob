# AGENTS

## Project Snapshot

- This repository is a customized `ShipAny Template Two` project.
- Stack: `Next.js 16` App Router, `React 19`, `TypeScript`, `pnpm`, `next-intl`, `Drizzle ORM`, `Better Auth`.
- The current product direction is no longer a generic AI SaaS shell. It is a fixed-template resume product focused on:
  - resume upload and parsing
  - JD-based resume tailoring
  - structured resume editing
  - DOCX/PDF export
  - credits / billing / payment flows

## Important Product Areas

- Landing and marketing content are driven by locale messages, especially:
  - `src/config/locale/messages/en/pages/index.json`
  - `src/config/locale/messages/zh/pages/index.json`
- Main user workspace routes:
  - `src/app/[locale]/(landing)/activity/intake/page.tsx`
  - `src/app/[locale]/(landing)/activity/resumes/page.tsx`
  - `src/app/[locale]/(landing)/activity/resumes/[id]/page.tsx`
  - `src/app/[locale]/(landing)/activity/tailoring/page.tsx`
  - `src/app/[locale]/(landing)/activity/exports/page.tsx`
- Core resume APIs:
  - `src/app/api/resume/intake/route.ts`
  - `src/app/api/resume/parse/route.ts`
  - `src/app/api/resume/tailor/route.ts`
  - `src/app/api/resume/update/route.ts`
  - `src/app/api/resume/export/route.ts`
  - `src/app/api/resume/list/route.ts`
- Core resume services:
  - `src/shared/services/resume.ts`
  - `src/shared/services/resume-export.ts`
- Payment / order lifecycle:
  - `src/app/api/payment/checkout/route.ts`
  - `src/app/api/payment/callback/route.ts`
  - `src/app/api/payment/notify/[provider]/route.ts`
  - `src/shared/services/payment.ts`
  - `src/shared/models/order.ts`
- Auth / user / permission foundations:
  - `src/core/auth/index.ts`
  - `src/shared/models/user.ts`
  - `src/shared/services/rbac.ts`
  - `src/core/rbac/permission.ts`

## Current Testing Baseline

- There is currently no first-party test setup in `package.json`.
- There are no committed `vitest`, `jest`, or `playwright` configs.
- The existing GitHub Actions workflow only builds and pushes Docker images:
  - `.github/workflows/docker-build.yaml`

## Engineering Memory Rules

### Testing First

- Every feature change must start by defining or updating the relevant automated test case(s).
- If strict red-green-refactor TDD is blocked by current code structure, the task is still not complete until automated tests for the change are added in the same workstream.
- No feature is considered done with manual verification alone.

### Regression Rule

- Every new unit test, integration test, or end-to-end test added for a feature must become part of the regression suite.
- After each feature update, run the regression suite before considering the change complete.
- Regressions must cover both happy-path behavior and the most relevant failure / permission / validation paths touched by the change.

### Preferred Testing Direction For This Repo

- Unit tests should focus on stable logic in `src/shared/lib`, `src/shared/services`, parsing helpers, payload builders, status transitions, and config-driven provider assembly.
- Integration tests should cover App Router API handlers and database-backed model flows with mocked external dependencies.
- E2E tests should protect the main product flow: intake -> parse -> edit -> tailor -> export.

## Delivery Reminder For Future AI Agents

- When changing resume workflow code, update tests first and keep the regression suite growing.
- When changing billing, auth, permission, or credits behavior, include negative-path tests.
- Prefer small, composable tests close to service and route boundaries before adding more browser coverage.
