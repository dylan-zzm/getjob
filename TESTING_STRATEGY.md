# Testing Strategy

## Current State

- The repository has no dedicated automated test stack yet.
- `package.json` does not define `test` scripts.
- CI currently runs only Docker build/push in `.github/workflows/docker-build.yaml`.
- The highest-value business path is the fixed-template resume workflow:
  - intake
  - parse
  - edit
  - tailor
  - export

## Goals

- Make every feature change test-driven or at minimum test-accompanied in the same change set.
- Build a regression suite that can be run after every feature update.
- Protect the most important business flows first, then expand to adjacent modules.

## Recommended Test Stack

- `Vitest` for unit and integration tests.
- `@testing-library/react` plus `jsdom` for client component behavior tests.
- `Playwright` for end-to-end regression.
- Temporary `SQLite` database for DB-backed integration tests where real persistence behavior matters.
- Module mocks for external dependencies:
  - AI provider calls
  - storage providers
  - payment providers
  - auth/session lookups
  - document conversion tools such as `soffice`

## Test Layers

### 1. Unit Tests

Focus on pure or mostly pure logic first:

- `src/shared/services/resume.ts`
  - supported file type checks
  - accept string generation
  - title building
  - document text normalization
- `src/shared/services/resume-export.ts`
  - template payload building
  - fallback behavior when sections are missing
- `src/shared/models/resume.ts`
  - `parseResumeContent`
  - `parseResumeAnalysis`
- `src/shared/models/config.ts`
  - env/db merge behavior
  - DB failure fallback logic
- Config-driven service factories:
  - `src/shared/services/payment.ts`
  - `src/shared/services/storage.ts`
  - `src/shared/services/email.ts`
  - `src/shared/services/analytics.ts`
  - `src/shared/services/affiliate.ts`
  - `src/shared/services/customer_service.tsx`

### 2. Integration Tests

Cover route handlers and service orchestration with mocks or temp DB:

- Resume APIs
  - `/api/resume/parse`
  - `/api/resume/intake`
  - `/api/resume/tailor`
  - `/api/resume/update`
  - `/api/resume/export`
  - `/api/resume/list`
- User APIs
  - `/api/user/get-user-info`
  - `/api/user/get-user-credits`
  - `/api/user/is-email-verified`
- Payment APIs
  - `/api/payment/checkout`
  - `/api/payment/callback`
  - `/api/payment/notify/[provider]`

Integration assertions should include:

- auth required
- ownership / permission checks
- validation failures
- success responses
- idempotency for payment callbacks and webhooks

### 3. Client Component Tests

Add focused UI tests around the product workbench components:

- `src/shared/resume/components/resume-intake-client.tsx`
  - required field validation
  - request payload generation
  - redirect after success
- `src/shared/resume/components/resume-editor-client.tsx`
  - form normalization before save
  - save request payload shape
- `src/shared/resume/components/resume-tailoring-client.tsx`
  - resume selection behavior
  - resubmission flow
- `src/shared/resume/components/resume-exports-client.tsx`
  - failed download handling
  - download trigger behavior

### 4. End-to-End Tests

Protect the business workflow end to end with Playwright:

- Authenticated user enters `/activity/intake`
- Upload resume + JD, submit, and land on tailoring page
- Open structured editor, save changes successfully
- Run tailoring again with a target role and JD
- Download DOCX export successfully

Second-wave E2E:

- Resume list and recent history rendering
- Permission gating for signed-out users
- Pricing checkout initiation with mocked payment provider

## Regression Suite Design

Proposed command split:

- `test:unit`
- `test:integration`
- `test:ui`
- `test:e2e`
- `test:regression` = runs the full suite in order

Recommended PR gate:

- `lint`
- `typecheck`
- `test:unit`
- `test:integration`

Recommended main-branch or release gate:

- `test:regression`

## Suggested Rollout Plan

### Phase 1: Test Infrastructure

- Add `Vitest`, `Testing Library`, `Playwright`, and shared test utilities.
- Add base configs, test scripts, and fixture directories.
- Add a lightweight CI workflow for tests.

### Phase 2: Core Resume Coverage

- Unit tests for resume parsing/export helpers.
- Integration tests for the six resume API routes.
- A first Playwright happy-path test for intake -> tailor -> export.

### Phase 3: Billing And Identity Coverage

- Integration tests for checkout, callback, and webhook flows.
- Tests for user info, credits, and email verification endpoints.
- Negative-path tests for auth and permission failures.

### Phase 4: Regression Hardening

- Add fixtures for representative resume files and JD inputs.
- Add shared mock builders for auth, config, payment sessions, and AI outputs.
- Expand E2E to cover editor updates and download behavior.

## Important Constraints

- PDF export depends on `soffice`; keep PDF behavior covered in integration tests with mocks unless CI guarantees LibreOffice availability.
- AI, storage, and payment providers must be mocked in automated tests. Do not rely on live third-party services for regression.
- Prefer direct route-handler imports and module mocking for fast integration tests before adding more browser-heavy coverage.

## Immediate Next Implementation Step

- Set up the test toolchain first.
- Then cover the resume workflow before touching less critical areas.
