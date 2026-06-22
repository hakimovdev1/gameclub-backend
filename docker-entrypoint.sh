#!/bin/sh
# Container entrypoint: bring the schema up to date, optionally ensure the
# first owner account exists, then hand off to the application as PID 1.
#
# Runs on every boot. `migration:run` is a no-op when there is nothing
# pending, and the seed is idempotent, so repeated restarts are safe.
set -e

echo "[entrypoint] running database migrations..."
node ./node_modules/typeorm/cli.js migration:run -d dist/database/data-source.js

# Seed the first OWNER account only when credentials are provided. Idempotent:
# it does nothing if the account already exists.
if [ -n "${SEED_OWNER_EMAIL}" ] && [ -n "${SEED_OWNER_PASSWORD}" ]; then
  echo "[entrypoint] ensuring owner account (${SEED_OWNER_EMAIL})..."
  node dist/database/seed.js
fi

echo "[entrypoint] starting application..."
exec "$@"
