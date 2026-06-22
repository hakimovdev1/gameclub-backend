# Deploying to a VPS with Coolify

This backend ships as a multi-stage Docker image. On every container boot it
**applies pending database migrations** (and optionally seeds the first owner
account) before starting the API — see `docker-entrypoint.sh`. You only need to
provide a PostgreSQL database and environment variables.

## What runs on boot

```
docker-entrypoint.sh
  ├─ typeorm migration:run     # creates / updates the schema (idempotent)
  ├─ seed owner (if SEED_* set) # creates first OWNER account (idempotent)
  └─ node dist/main.js          # starts the API on PORT (default 4040)
```

## 1. Create the PostgreSQL database in Coolify

1. In your Coolify project: **+ New Resource → Database → PostgreSQL** (v16).
2. After it starts, open the database and note:
   - **Internal hostname** (e.g. `postgresql-xxxxxxxx`) → this is `DB_HOST`.
   - Username, password, database name.
3. The managed Postgres user is a superuser, so the migration that runs
   `CREATE EXTENSION "uuid-ossp"` succeeds without extra setup.

> Prefer a managed database over bundling Postgres in the app — you get
> backups and independent restarts. Keep the database in the **same Coolify
> project** as the app so they share an internal network.

## 2. Create the application

1. **+ New Resource → Public/Private Repository**, point it at this repo.
2. **Build Pack: Dockerfile** (Coolify auto-detects the `Dockerfile`).
3. **Port / Ports Exposes: `4040`**.
4. **Health check path: `/api/v1/health`** (the image also has a built-in
   Docker `HEALTHCHECK` on this path).
5. Attach your domain; Coolify/Traefik terminates TLS in front of the app.

## 3. Set environment variables

Copy from `.env.production.example`. The required ones:

| Variable | Notes |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `4040` (match Ports Exposes) |
| `DB_HOST` | the Postgres **internal** hostname from step 1 |
| `DB_PORT` / `DB_USERNAME` / `DB_PASSWORD` / `DB_DATABASE` | from step 1 |
| `DB_SYNCHRONIZE` | **`false`** — boot refuses `true` in production |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | each ≥ 32 chars, generate below |
| `CORS_ORIGINS` | your frontend origin(s), comma-separated, no trailing slash |
| `COOKIE_SECURE` | `true` (served over HTTPS) |
| `TRUST_PROXY` | `1` (Coolify/Traefik is one hop in front) |
| `SEED_OWNER_EMAIL` / `SEED_OWNER_PASSWORD` | optional first-owner bootstrap |

Generate strong secrets:

```bash
openssl rand -hex 32   # run twice — one for each JWT secret
```

> **Boot will fail fast** if a JWT secret is weak/missing or `DB_SYNCHRONIZE`
> is `true` in production. This is intentional (see `src/config/env.validation.ts`).

## 4. Deploy

Click **Deploy**. Watch the logs for:

```
[entrypoint] running database migrations...
Migration Schema... has been executed successfully.
[entrypoint] ensuring owner account ...     (only if SEED_* set)
[entrypoint] starting application...
API ready on http://localhost:4040/api/v1
```

Verify:

- `https://<your-domain>/api/v1/health` → `200`
- `https://<your-domain>/docs` → Swagger UI

After the first successful deploy you can remove `SEED_OWNER_*` (the seed is a
no-op once the account exists) or leave them in place.

## Migrations going forward

The schema is managed by TypeORM migrations in `src/database/migrations`.
When you change an entity:

```bash
# against a database that reflects the current (pre-change) schema:
pnpm run migration:generate    # writes src/database/migrations/<ts>-Schema.ts
pnpm run build
git commit ...                 # commit the generated migration
```

The next Coolify deploy applies it automatically on boot. No manual step on the
VPS is required.

## Local production-like run

`docker-compose.yml` brings up Postgres + the API with the same entrypoint:

```bash
JWT_ACCESS_SECRET=$(openssl rand -hex 32) \
JWT_REFRESH_SECRET=$(openssl rand -hex 32) \
docker compose up --build
```
