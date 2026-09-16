# KakeiVault Architecture

> Last reviewed: 2026-09-16

## Monorepo Structure

```
kakeivault/
├── apps/
│   ├── mobile/          # Expo 52 + Expo Router 4
│   ├── web/             # Next.js 15 (App Router) PWA
│   └── api/             # FastAPI + ARQ background worker
├── packages/
│   ├── contracts/       # Zod schemas — single source of truth for API types
│   ├── domain/          # Pure financial calculation functions (no I/O)
│   ├── i18n/            # ja-JP and en translation strings
│   ├── validation/      # Shared file validation, idempotency key generation
│   └── config/          # Shared constants (categories, limits, etc.)
├── infrastructure/
├── docs/
├── docker-compose.yml
└── .env.example
```

## Decision Records

### DR-001: Integer minor units for money

All monetary amounts are stored as integer minor units (JPY × 100). This avoids binary floating-point rounding errors when summing multiple transactions. All financial calculations use integer arithmetic.

Rationale: JPY has no fractional units in practice, but storing as × 100 maintains consistency with future multi-currency support (e.g., USD cents).

### DR-002: Three-record OCR architecture

Original problem: if OCR data is stored in a single mutable record, a background refetch could overwrite user corrections.

Solution:

1. `ocr_results` — immutable raw provider output (written once by worker)
2. `ocr_jobs.user_review_data` — user corrections (written by PATCH /review, never overwritten)
3. `transactions` — confirmed final values (created from `user_review_data`)

### DR-003: Pluggable OCR provider interface

`OcrProvider` is an abstract class. Phase 0 ships `StubOcrProvider`. Phase 2 adds `GoogleVisionProvider`. The product code never imports provider classes directly — only through `get_ocr_provider(settings.ocr_provider)`.

### DR-004: Auth provider choice

Custom JWT implementation (FastAPI + python-jose + bcrypt) rather than a hosted auth provider. Rationale: privacy-first product, Japan data residency requirement, avoid third-party session storage.

### DR-005: Separate receipt and salary-slip pipelines

Receipt OCR and salary-slip extraction are separate async pipelines. Salary data has stricter privacy requirements (never logged, never in analytics). Keeping pipelines separate allows different providers, retention policies, and audit rules.

### DR-006: Entitlement abstraction

`Subscription` model stores plan, platform, and `platform_subscription_id`. The entitlement check service reads the `Subscription` table — never hardcodes plan logic in product code. This allows:

- iOS: StoreKit receipt validation (Phase 5)
- Android: Google Play Billing purchase token (Phase 5)
- Web: separate web billing (Phase 5)

### DR-007: pnpm workspaces + Turborepo

Selected over Nx and Lerna for simplicity. Turborepo handles incremental builds; pnpm workspaces handle dependency hoisting. Python (FastAPI) is not managed by Turborepo — it uses its own `pyproject.toml`.

## Data Flow Diagrams

See `docs/privacy-data-flow.md` for detailed data flow diagrams.

## Deployment Targets

| Target   | Technology                                               |
| -------- | -------------------------------------------------------- |
| iPhone   | iOS App Store (Expo EAS Build)                           |
| iPad     | Same app, adaptive layout (sidebar/split view)           |
| Android  | Google Play Store (Expo EAS Build)                       |
| MacBook  | Next.js PWA (installable via Chrome/Safari)              |
| API      | Docker container on any VPS or managed container service |
| Database | PostgreSQL 16 (managed or self-hosted)                   |
| Storage  | AWS S3 or self-hosted MinIO                              |
| Queue    | Redis 7                                                  |
