# KakeiVault

**プライバシー重視の家計・書類管理アプリ**
Privacy-first personal finance and document management for Japan.

---

## Features (Phase 0 — Foundation)

- ✅ Monorepo (pnpm workspaces + Turborepo)
- ✅ FastAPI backend with SQLAlchemy 2, Alembic, Pydantic 2
- ✅ Next.js 15 PWA (installable on MacBook)
- ✅ Expo 52 + Expo Router 4 (iPhone, iPad, Android)
- ✅ PostgreSQL 16, Redis 7, MinIO (S3-compatible)
- ✅ Shared TypeScript contracts, domain logic, i18n (ja-JP / en)
- ✅ JWT authentication with HttpOnly cookies (web) / SecureStore (mobile)
- ✅ Security model, privacy data flow, threat model documentation
- ✅ GitHub Actions CI

## Quick Start

### Prerequisites

- Node.js 22+
- pnpm 9+
- Python 3.12+
- Docker + Docker Compose

### 1. Clone and install

```bash
git clone <repo-url>
cd kakeivault
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env and fill in all REQUIRED values
```

**Required values to change:**

- `POSTGRES_PASSWORD`
- `REDIS_PASSWORD`
- `JWT_SECRET_KEY` (64+ random characters: `python -c "import secrets; print(secrets.token_hex(64))"`)
- `MINIO_ROOT_PASSWORD`
- `STORAGE_SECRET_ACCESS_KEY`

### 3. Start infrastructure

```bash
docker compose up -d postgres redis minio minio-init
```

### 4. Run database migrations

```bash
cd apps/api
pip install -e ".[dev]"
alembic upgrade head
```

### 5. Start development servers

```bash
# Terminal 1: API
cd apps/api
uvicorn app.main:app --reload

# Terminal 2: Web
cd apps/web
pnpm dev

# Terminal 3: Mobile (iOS Simulator or Android Emulator)
cd apps/mobile
pnpm start
```

Or start everything with Docker Compose:

```bash
docker compose up
```

---

## Architecture

See [`docs/architecture.md`](docs/architecture.md) for full architecture documentation.

### Monorepo structure

```
kakeivault/
├── apps/
│   ├── api/             FastAPI + SQLAlchemy 2 + ARQ
│   ├── web/             Next.js 15 PWA
│   └── mobile/          Expo 52 + Expo Router 4
├── packages/
│   ├── contracts/       Zod schemas (API types)
│   ├── domain/          Financial calculations (decimal-safe)
│   ├── i18n/            ja-JP + en translations
│   ├── validation/      File validation, idempotency keys
│   └── config/          Shared constants
├── docs/
│   ├── architecture.md
│   ├── security-model.md
│   ├── privacy-data-flow.md
│   └── threat-model.md
└── docker-compose.yml
```

---

## Testing

```bash
# All TypeScript tests
pnpm test

# API tests only
cd apps/api
pytest -v

# Domain unit tests
cd packages/domain
pnpm test

# i18n consistency test
cd packages/i18n
pnpm test
```

---

## Building

### Web (PWA)

```bash
cd apps/web
pnpm build
pnpm start
```

### Android

```bash
cd apps/mobile
# Install EAS CLI
npm install -g eas-cli
eas build --platform android
```

See [`docs/android-build.md`](docs/android-build.md) for detailed instructions.

### iOS / iPadOS / TestFlight

```bash
cd apps/mobile
eas build --platform ios
```

See [`docs/ios-build.md`](docs/ios-build.md) for detailed instructions.

### MacBook PWA Installation

1. Open the web app in Chrome or Safari on macOS.
2. Chrome: click the install icon in the address bar (⊕).
3. Safari: File → Add to Dock.

---

## Security

See [`docs/security-model.md`](docs/security-model.md) and [`docs/threat-model.md`](docs/threat-model.md).

**Never:**

- Commit `.env` to git
- Hardcode secrets in source code
- Use `JWT_SECRET_KEY` from `.env.example` in production

---

## Privacy

See [`docs/privacy-data-flow.md`](docs/privacy-data-flow.md).

User data is stored in Japan (ap-northeast-1) by default. No data is shared with third parties except the OCR provider during document processing (disclosed to users).

---

## Development Phases

| Phase | Status      | Contents                                                   |
| ----- | ----------- | ---------------------------------------------------------- |
| 0     | ✅ Complete | Foundation, monorepo, DB, auth, contracts, i18n, CI        |
| 1     | 🔲 Planned  | Register/login UI, dashboard, manual transactions, budgets |
| 2     | 🔲 Planned  | Receipt scan, OCR, review/confirm workflow                 |
| 3     | 🔲 Planned  | Salary slips, document vault                               |
| 4     | 🔲 Planned  | CSV/Excel export, offline support, charts                  |
| 5     | 🔲 Planned  | Security review, App Store release, PWA polish             |

---

## License

Proprietary — all rights reserved.
