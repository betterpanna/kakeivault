# KakeiVault Security Model

> Last reviewed: 2026-09-16

## Authentication

| Concern                     | Decision                                                                      |
| --------------------------- | ----------------------------------------------------------------------------- |
| Credential storage (mobile) | expo-secure-store (iOS Keychain / Android Keystore). Never AsyncStorage.      |
| Credential storage (web)    | HttpOnly, Secure, SameSite=Lax cookies. Never localStorage or sessionStorage. |
| Access token lifetime       | 15 minutes                                                                    |
| Refresh token lifetime      | 30 days                                                                       |
| Token algorithm             | HS256 (upgrade to RS256 for multi-service in Phase 5)                         |
| Password hashing            | bcrypt, work factor 12                                                        |
| Email verification          | 24-hour URL-safe token, hashed in DB                                          |
| Password reset              | 1-hour URL-safe token, hashed in DB                                           |

### JWT Claims

Access token payload:

```json
{
  "sub": "<user-uuid>",
  "exp": <unix timestamp>,
  "iat": <unix timestamp>,
  "type": "access"
}
```

No user email, plan, or sensitive data is embedded in the JWT. User data is loaded from the DB on every authenticated request.

### Every Request

- `get_current_user()` dependency is applied on every protected endpoint.
- User ownership is checked at the service layer (not just at the router level).
- A user can only read or write their own records.

## Storage Security

- All S3 objects are in a **private bucket** with no public ACL.
- Access is exclusively through **presigned URLs with 15-minute expiry**.
- Storage keys are UUID-based paths scoped per user: `{purpose}/{user_id}/{uuid}.{ext}`
- File type validation is performed server-side before presign (MIME allowlist + size limit).
- Malware scanning integration point is reserved in the upload pipeline (Phase 5).

## API Security

- Rate limiting: slowapi (Redis-backed), per-IP.
  - Auth endpoints: 10 req/hour
  - Upload endpoints: 30 req/hour
  - OCR endpoints: 20 req/hour
- CORS: restricted to declared origins only.
- No secrets in error responses.
- No stack traces in production responses.
- `X-Content-Type-Options: nosniff` on all responses.
- `X-Frame-Options: DENY` on all responses.

## Sensitive Data Handling

| Data type              | Handling                                                       |
| ---------------------- | -------------------------------------------------------------- |
| Salary amounts         | Never logged. `__repr__` excludes amounts. Not in analytics.   |
| OCR document content   | Stored in `ocr_results.raw_text` only. Not in job status logs. |
| Uploaded file contents | Never logged. Deleted from temp after OCR retention period.    |
| Auth tokens            | Never logged (only `user.id` is logged).                       |
| Passwords              | Never stored in plaintext. Never logged.                       |

## Audit Events

Sensitive operations write an `audit_event` record:

- User registration
- Login / logout
- Email verification
- Password reset
- Account deletion
- Document upload / download / delete
- OCR job creation and confirmation
- Salary slip confirmation

Audit events must NOT include salary amounts or document contents.

## Account Deletion

1. User confirms deletion phrase and password.
2. Audit event written.
3. All documents deleted from S3.
4. All temporary OCR files deleted from S3.
5. User record deleted (cascade to all owned data).
6. Email address is anonymised to prevent re-registration conflicts.

## Future Work (Phase 5)

- Rotate to RS256 tokens for multi-service JWT verification.
- Add malware scanning at upload.
- Add certificate pinning on mobile.
- Conduct external penetration test.
- Implement SOC 2 Type I audit trail.
