# KakeiVault Privacy Data Flow

> Last reviewed: 2026-09-16

## Personal Data Inventory

| Data category       | Where stored                         | Retention                         | Access                            |
| ------------------- | ------------------------------------ | --------------------------------- | --------------------------------- |
| Email address       | PostgreSQL `users`                   | Until account deletion            | User, API (authenticated)         |
| Password hash       | PostgreSQL `users`                   | Until account deletion            | API only (never returned)         |
| Transaction records | PostgreSQL `transactions`            | User-controlled                   | User only                         |
| Document files      | S3 private bucket                    | User-controlled retention setting | Presigned URL, user only          |
| OCR raw text        | PostgreSQL `ocr_results.raw_text`    | OCR job retention                 | Never returned to client directly |
| Salary data         | PostgreSQL `salary_slips`            | User-controlled                   | User only, never logged           |
| Audit events        | PostgreSQL `audit_events`            | 2 years (configurable)            | API admin only                    |
| IP addresses        | PostgreSQL `audit_events.ip_address` | 2 years                           | API admin only                    |

## Data Flow — Receipt Scan

```
Mobile camera / file picker
  ↓ (file bytes stay on device until upload)
Presign request → API (authenticated) → MinIO presigned PUT URL (15 min expiry)
  ↓
Direct upload from client → MinIO private bucket
  ↓
Create OCR job (POST /api/v1/ocr/jobs) → ARQ queue
  ↓
Worker: fetch file from MinIO (server-side) → OCR provider (private API call)
  ↓
Raw text → stored in ocr_results (never logged)
Structured extraction → stored in ocr_jobs.extracted_data (no raw text)
  ↓
Status: review_required → client polls
  ↓
User reviews and corrects → PATCH /ocr/jobs/{id}/review
  (corrections stored in user_review_data; OCR data is NEVER overwritten)
  ↓
User confirms → POST /ocr/jobs/{id}/confirm
  ↓
Transaction created from user_review_data (not raw OCR)
  ↓
Temporary OCR file: deleted after retention period (1 hour default)
```

## Data Flow — Salary Slip

Same upload flow as receipt. Salary amounts are:

- Never logged in application logs.
- Never included in analytics or crash reporting.
- Only accessible to the owning user via authenticated API.
- User must explicitly confirm before amounts are saved.

## Third-Party Data Sharing

| Service                | Data shared                        | Consent mechanism                                |
| ---------------------- | ---------------------------------- | ------------------------------------------------ |
| OCR provider (Phase 2) | Document image / text for analysis | Disclosed in privacy policy; user initiates scan |
| Email provider (SMTP)  | Email address only                 | Required for account creation                    |
| No other third parties | —                                  | —                                                |

KakeiVault does NOT:

- Share data with advertisers.
- Use customer documents to train models.
- Send files to undisclosed third-party processors.
- Store raw files permanently without disclosing retention to the user.

## User Rights

| Right         | How to exercise                                       |
| ------------- | ----------------------------------------------------- |
| Access        | GET /api/v1/account/export                            |
| Portability   | POST /api/v1/account/export (CSV or JSON)             |
| Deletion      | DELETE /api/v1/account (all data permanently deleted) |
| Rectification | PATCH /api/v1/transactions/{id}                       |
| Restriction   | Document retention setting per document               |

## Cross-Border Data Transfer

Default deployment target: Japan (ap-northeast-1). No cross-border transfer by default. Any change must update this document and the privacy policy.
