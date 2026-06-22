import { ValueTransformer } from 'typeorm';

/**
 * Persists integer money as a Postgres `bigint`. The driver returns
 * `bigint` columns as strings to avoid precision loss; we keep the value
 * as a plain integer `number` on the entity (validated to stay within the
 * safe integer range by the Money value object at the domain boundary).
 */
export const moneyColumnTransformer: ValueTransformer = {
  to(value?: number | null): string | null {
    if (value === null || value === undefined) {
      return null;
    }
    return Math.trunc(value).toString();
  },
  from(value?: string | null): number | null {
    if (value === null || value === undefined) {
      return null;
    }
    return parseInt(value, 10);
  },
};
