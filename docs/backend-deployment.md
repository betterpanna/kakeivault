# KakeiVault Backend Deployment Guide

This guide explains how to deploy the FastAPI + PostgreSQL backend so that
the Vercel-hosted web app can authenticate users in production.

## Why the backend is needed

The `/login`, `/register`, `/refresh`, and `/me` endpoints all live in the
FastAPI service (`apps/api`).  Until this service is running on a public URL,
the web app forms will show a network error after the user clicks "Log in".

---

## Option A — Railway (recommended, ~5 min)

[Railway](https://railway.app) can deploy the FastAPI service directly from
GitHub and provision a managed PostgreSQL database in one click.

### 1. Create a Railway project

1. Go to <https://railway.app> and sign in with GitHub.
2. **New Project → Deploy from GitHub repo → betterpanna/kakeivault**.
3. Select the repo and choose **"Deploy a service from a specific path"**.
   - Root directory: `apps/api`
   - Railway detects the `Dockerfile` automatically.

### 2. Add a PostgreSQL database

In the same Railway project click **+ New → Database → PostgreSQL**.
Railway automatically injects `POSTGRES_*` variables into all services.

### 3. Set environment variables on the API service

Go to **Service → Variables** and add:

| Variable | Example / Notes |
|---|---|
| `DATABASE_URL` | Set to `${{Postgres.DATABASE_URL}}` (Railway variable reference) |
| `REDIS_URL` | `redis://localhost:6379/0` (or add a Redis service and use reference) |
| `JWT_SECRET_KEY` | Generate: `python -c "import secrets; print(secrets.token_hex(64))"` |
| `JWT_ALGORITHM` | `HS256` |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | `15` |
| `JWT_REFRESH_TOKEN_EXPIRE_DAYS` | `30` |
| `ENVIRONMENT` | `production` |
| `DEBUG` | `false` |
| `CORS_ORIGINS` | `https://kakeivault.vercel.app` (your Vercel URL, comma-separated) |
| `COOKIE_SECURE` | `true` |
| `COOKIE_SAMESITE` | `lax` |
| `COOKIE_DOMAIN` | Leave empty (rewrite proxy handles same-origin) |
| `STORAGE_ENDPOINT_URL` | Set when S3/MinIO is ready; use `http://localhost:9000` for stub |
| `STORAGE_ACCESS_KEY_ID` | Your S3 / MinIO access key |
| `STORAGE_SECRET_ACCESS_KEY` | Your S3 / MinIO secret key |
| `STORAGE_BUCKET_NAME` | `kakeivault` |
| `OCR_PROVIDER` | `stub` (no OCR in Phase 1) |
| `WEB_BASE_URL` | `https://kakeivault.vercel.app` |
| `SMTP_HOST` | Leave blank for Phase 1 (email not required for login/register) |

### 4. Run database migrations

After the first deploy, open a Railway shell and run:

```bash
cd /app
alembic upgrade head
```

Or add it as a **deploy command** in Railway's service settings:
`alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### 5. Get the public API URL

Railway assigns a public URL like `https://kakeivault-api-production.up.railway.app`.
Copy it.

---

## Option B — Render

1. Sign in at <https://render.com>.
2. **New → Web Service → Connect GitHub → betterpanna/kakeivault**.
3. Root directory: `apps/api`.
4. Start command: `alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
5. Add a **PostgreSQL** instance from the Render dashboard and set `DATABASE_URL`.
6. Add the same environment variables as above.

---

## Step 6 — Set NEXT_PUBLIC_API_URL in Vercel

1. Go to your Vercel project → **Settings → Environment Variables**.
2. Add:
   - `NEXT_PUBLIC_API_URL` = `https://your-api-url.railway.app`
     (or whatever URL Railway / Render assigned)
3. **Redeploy** the web app so `next.config.ts` picks up the new rewrite target.

Because `next.config.ts` rewrites `/api/*` to the backend URL, the browser
never talks cross-origin.  The `HttpOnly` cookies are always same-origin
(`SameSite=Lax` is sufficient).

---

## Local development (no cloud needed)

```bash
# 1. Copy the example env file
cp .env.example .env
# Edit .env and fill in POSTGRES_PASSWORD, JWT_SECRET_KEY, REDIS_PASSWORD, etc.

# 2. Start all services (PostgreSQL, Redis, MinIO, API)
docker compose up -d

# 3. Run database migrations
docker compose exec api alembic upgrade head

# 4. Start the web app
pnpm dev
```

The web app runs on http://localhost:3000.
Next.js rewrites /api/* → http://localhost:8000 automatically.

---

## Verifying production login works

After both steps above:

1. Visit `https://kakeivault.vercel.app/register`.
2. Create an account (email + strong password).
3. Visit `https://kakeivault.vercel.app/login` and log in.
4. You should land on `/dashboard` showing your email.
5. Refresh the page — you should stay logged in.
6. Click "Log Out" — you should return to `/login`.
7. Try navigating directly to `/dashboard` — you should be redirected to `/login`.

---

## Checklist before announcing production login

- [ ] FastAPI service is deployed and the `/healthz` endpoint returns `{"status":"ok"}`
- [ ] `alembic upgrade head` has been run (all tables created)
- [ ] `NEXT_PUBLIC_API_URL` is set in Vercel to the API URL
- [ ] Vercel has been redeployed after setting the env var
- [ ] `CORS_ORIGINS` on the API includes your Vercel URL
- [ ] `COOKIE_SECURE=true` on the API
- [ ] A Redis instance is running (rate limiting requires it)
