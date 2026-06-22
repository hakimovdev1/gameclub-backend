import { registerAs } from '@nestjs/config';

/**
 * Strongly-typed application configuration.
 *
 * Every value is sourced from the environment and validated at boot
 * (see `env.validation.ts`). Feature code must depend on these typed
 * namespaces rather than reading `process.env` directly.
 */

export const appConfig = registerAs('app', () => ({
  env: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '4040', 10),
  apiPrefix: process.env.API_PREFIX ?? 'api',
  defaultVersion: process.env.API_VERSION ?? '1',
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  // Number of reverse-proxy hops to trust for X-Forwarded-* (client IP and
  // protocol). Coolify/Traefik terminates TLS one hop in front of the app,
  // so the default of 1 is correct; raise it only for additional proxies.
  trustProxy: parseInt(process.env.TRUST_PROXY ?? '1', 10),
}));

export const databaseConfig = registerAs('database', () => ({
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_DATABASE ?? 'gameclub',
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  logging: process.env.DB_LOGGING === 'true',
}));

export const authConfig = registerAs('auth', () => ({
  accessSecret: process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret-change-me',
  refreshSecret:
    process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret-change-me',
  accessTtl: process.env.JWT_ACCESS_TTL ?? '900s',
  refreshTtl: process.env.JWT_REFRESH_TTL ?? '30d',
  refreshTtlMs: parseInt(
    process.env.JWT_REFRESH_TTL_MS ?? `${30 * 24 * 60 * 60 * 1000}`,
    10,
  ),
  cookieDomain: process.env.COOKIE_DOMAIN ?? undefined,
  cookieSecure: process.env.COOKIE_SECURE === 'true',
}));

export const configurations = [appConfig, databaseConfig, authConfig];
