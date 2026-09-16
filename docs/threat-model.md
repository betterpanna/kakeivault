# KakeiVault Threat Model

> Last reviewed: 2026-09-16
> Method: STRIDE

## Assets

1. User financial transaction records
2. Uploaded documents (receipts, salary slips)
3. Authentication credentials
4. OCR-extracted data (salary amounts)
5. S3 storage objects

---

## Threats

### T1 — Spoofing: Credential stuffing / brute force login

**Mitigations:**

- Rate limiting on `/auth/login`: 10 req/hour per IP (slowapi + Redis)
- bcrypt work factor 12 (computationally expensive per attempt)
- Generic error message on failure (no user enumeration)
- Account lockout (Phase 5 enhancement)

**Residual risk:** Medium — motivated attacker with many IPs

---

### T2 — Tampering: User modifies another user's data

**Mitigations:**

- Every service method validates `user_id` matches `current_user.id`
- Database foreign keys enforce ownership at storage level
- JWT verification on every request (no session server)

**Residual risk:** Low — double-checked at API + DB level

---

### T3 — Repudiation: Denial of sensitive operations

**Mitigations:**

- Append-only `audit_events` table for all sensitive operations
- Events include timestamp, IP address, user agent
- Events cannot be deleted by users (separate admin access)

**Residual risk:** Low

---

### T4 — Information Disclosure: Token exposure

**Mitigations:**

- Web: HttpOnly cookies (inaccessible to JavaScript)
- Mobile: iOS Keychain / Android Keystore via expo-secure-store
- Access tokens expire in 15 minutes
- Tokens never logged
- No tokens in URLs, localStorage, or error responses

**Residual risk:** Low — XSS on web could extract cookies if `httponly=False`; currently `httponly=True`

---

### T5 — Information Disclosure: Salary/document data in logs

**Mitigations:**

- `SalarySlip.__repr__` excludes all amounts
- `OcrResult.raw_text` and `provider_response` are marked as not-to-be-logged
- Log level for sensitive workers is INFO (not DEBUG in production)
- Structured logging with explicit field allowlists (Phase 5)

**Residual risk:** Medium — relies on developer discipline; structured log enforcement is Phase 5

---

### T6 — Information Disclosure: S3 object public access

**Mitigations:**

- Bucket ACL is `private` (enforced at bucket creation by minio-init)
- All object access is via presigned URLs with 15-minute expiry
- Storage keys are UUID-based (not guessable)
- `verify_object_exists()` called before creating DB record

**Residual risk:** Low

---

### T7 — Denial of Service: OCR job flooding

**Mitigations:**

- Rate limiting on OCR endpoints: 20 req/hour per IP
- Free plan: 10 scans per month (entitlement check, Phase 2)
- ARQ worker `max_jobs = 5` (prevents memory exhaustion)

**Residual risk:** Medium — persistent attacker with many IPs could still queue many jobs

---

### T8 — Elevation of Privilege: JWT algorithm confusion

**Mitigations:**

- Algorithm is hardcoded to HS256 in `decode_token()` — `algorithms=[settings.jwt_algorithm]`
- `expected_type` check in `decode_token()` prevents access token used as refresh token
- Upgrade to RS256 planned for Phase 5

**Residual risk:** Low

---

### T9 — Tampering: Malicious file upload

**Mitigations:**

- MIME type allowlist enforced before presign (server-side)
- File size limit: 20 MB
- Files processed server-side only (worker downloads and processes)
- Malware scanning integration point reserved (Phase 5)
- No server-side code execution from uploaded files

**Residual risk:** Medium — no malware scanning in MVP

---

### T10 — Information Disclosure: OCR data overwrite after user correction

**Threat:** Background refetch overwrites user-corrected OCR data with original OCR values.

**Mitigations:**

- Three separate records: `ocr_results` (raw, immutable), `ocr_jobs.user_review_data` (user corrections, never overwritten), `transactions` (confirmed final)
- `PATCH /review` merges corrections into `user_review_data` only
- `POST /confirm` reads from `user_review_data`, not `extracted_data`
- Test T10 is included in the test suite

**Residual risk:** Low — architectural separation enforced

---

## Out of Scope (MVP)

- Passport / My Number extraction
- Bank account integration
- Investment advice / tax advice
- Multi-tenant / family isolation (Family plan is Phase 5+)
- Certificate pinning on mobile
- SOC 2 compliance
