# Game Club Management — Backend

Production-grade NestJS + PostgreSQL backend for running a game club: it
**controls computers** and handles **deterministic, integer-based money**
(sessions, pricing, payments, and an event-sourced debt ledger).

## Why the money is correct

- All monetary values are **whole integer minor units** (so'm) held in a
  `Money` value object — no floating point anywhere in storage or
  calculation (`src/common/money/money.ts`).
- Persisted as Postgres `bigint` via a lossless transformer.
- Time-based charges use **deterministic half-up integer rounding**:
  `round(ratePerHour × seconds / 3600)`.
- Room price is **snapshotted onto the session** at start, so later price
  changes never rewrite history.
- Ending a session **finalises the charge, takes payment, and pushes any
  shortfall to the debt ledger in a single database transaction** — the
  amount due and the debt can never disagree.
- The customer debt balance is **never stored**; it is the signed `SUM()`
  of an append-only ledger (`DEBT_ADD` / `DEBT_PAYMENT` / `DEBT_CORRECTION`).

## Architecture

Feature-based modules with clean boundaries, repository pattern,
DI, and DB transactions for every multi-write operation.

```
src/
  common/        Money, BaseEntity, guards, interceptors, filters, cache
  config/        Typed config + env validation (fail-fast)
  database/      DataSource (CLI), runtime DB module, seed
  modules/
    auth/        Argon2id, JWT access + refresh-token rotation (reuse detection)
    users/       Staff accounts + RBAC roles
    rooms/       Pricing zones (hourly rate)
    computers/   Workstations + status lifecycle
    sessions/    FIXED_DURATION / FIXED_END_TIME / OPEN_SESSION, group sessions,
                 atomic creation, deterministic pricing engine
    customers/   Patrons
    debt/        Event-sourced financial ledger
    analytics/   Cached aggregation KPIs
    audit/       Immutable, append-only audit log + interceptor
    notifications/ Event-driven operational inbox
    settings/    Runtime key/value config
    realtime/    Authenticated Socket.IO gateway (event fan-out, no polling)
    health/      Liveness / readiness probes
```

## Security

Argon2id password hashing, JWT in HTTP-only cookies, refresh-token
rotation with theft detection, RBAC, Helmet, CORS allow-list with
credentials, rate limiting + login throttling, brute-force lockout,
strict DTO validation (`whitelist` + `forbidNonWhitelisted`), immutable
audit logging, soft deletes, optimistic locking, and a single
consistent response/error envelope (no stack traces leaked).

## Running

### With Docker (recommended)

```bash
export JWT_ACCESS_SECRET=$(openssl rand -base64 32)
export JWT_REFRESH_SECRET=$(openssl rand -base64 32)
docker compose up --build
```

### Local

```bash
pnpm install
cp .env.example .env          # then edit secrets / DB creds
# Dev first run can use DB_SYNCHRONIZE=true; production uses migrations:
pnpm run migration:run        # against a running Postgres
pnpm run seed                 # creates the first OWNER (SEED_OWNER_* env)
pnpm run start:dev
```

- API: `http://localhost:4040/api/v1`
- Swagger: `http://localhost:4040/docs`
- WebSocket: `ws://localhost:4040/realtime` (access token required)

## Database migrations

`synchronize` is for local development only. For production:

```bash
pnpm run migration:generate   # diff entities -> new migration
pnpm run migration:run
pnpm run migration:revert
```

## Tests

```bash
pnpm test            # unit tests (Money + pricing engine covered)
pnpm run test:cov
```

## Core API surface (`/api/v1`)

| Area      | Endpoints |
|-----------|-----------|
| Auth      | `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me`, `POST /auth/change-password` |
| Users     | `CRUD /users` (OWNER) |
| Rooms     | `CRUD /rooms` |
| Computers | `CRUD /computers` |
| Customers | `CRUD /customers` |
| Sessions  | `POST /sessions`, `GET /sessions(/active)`, `GET /sessions/:id/quote`, `POST /sessions/:id/{extend,end,cancel}` |
| Debt      | `GET .../debt/balance`, `GET .../debt/ledger`, `POST .../debt/payments`, `POST .../debt/corrections` |
| Analytics | `GET /analytics/summary` |
| Audit     | `GET /audit-logs` (OWNER) |
| Health    | `GET /health`, `GET /health/ready` |
# gameclub-backend
