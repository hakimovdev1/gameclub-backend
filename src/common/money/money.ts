/**
 * Money — an immutable value object for currency amounts.
 *
 * The entire platform stores and computes money as **whole integer minor
 * units** (for UZS that is 1 so'm; the system has no sub-so'm concept).
 * Floating point is never used for storage or comparison, which removes
 * the class of bugs where `0.1 + 0.2 !== 0.3`.
 *
 * Internally the amount is held as a JavaScript `number` constrained to a
 * safe integer. All factory paths reject non-integers and values outside
 * `Number.MAX_SAFE_INTEGER`, so arithmetic is exact and deterministic
 * across machines. For persistence we serialise to a base-10 string via a
 * TypeORM transformer (see `money.transformer.ts`) so a Postgres `bigint`
 * column round-trips losslessly.
 */
export class Money {
  private constructor(private readonly minor: number) {}

  static readonly ZERO = new Money(0);

  /** Build from a trusted integer count of minor units. */
  static fromMinor(value: number): Money {
    if (!Number.isInteger(value)) {
      throw new Error(`Money requires an integer amount, received ${value}`);
    }
    if (!Number.isSafeInteger(value)) {
      throw new Error(`Money amount ${value} exceeds the safe integer range`);
    }
    return new Money(value);
  }

  /** Build from a persisted/string representation (e.g. Postgres bigint). */
  static fromString(value: string): Money {
    if (!/^-?\d+$/.test(value)) {
      throw new Error(`Cannot parse Money from "${value}"`);
    }
    return Money.fromMinor(Number(value));
  }

  /**
   * Compute a time-based charge with deterministic half-up rounding.
   *
   * charge = round( ratePerHour * durationSeconds / 3600 )
   *
   * `ratePerHour` and `durationSeconds` are integers, so the numerator is
   * an exact integer. We perform the rounding with integer math (no
   * float division) to guarantee identical results on every platform.
   */
  static forDuration(ratePerHourMinor: number, durationSeconds: number): Money {
    if (!Number.isInteger(ratePerHourMinor) || ratePerHourMinor < 0) {
      throw new Error(`Invalid hourly rate: ${ratePerHourMinor}`);
    }
    if (!Number.isInteger(durationSeconds) || durationSeconds < 0) {
      throw new Error(`Invalid duration: ${durationSeconds}`);
    }
    const numerator = ratePerHourMinor * durationSeconds;
    if (!Number.isSafeInteger(numerator)) {
      throw new Error('Duration charge overflows the safe integer range');
    }
    // Half-up integer rounding: (n + d/2) / d with integer division.
    const denominator = 3600;
    const rounded = Math.floor(
      (numerator * 2 + denominator) / (denominator * 2),
    );
    return Money.fromMinor(rounded);
  }

  get value(): number {
    return this.minor;
  }

  add(other: Money): Money {
    return Money.fromMinor(this.minor + other.minor);
  }

  subtract(other: Money): Money {
    return Money.fromMinor(this.minor - other.minor);
  }

  multiply(factor: number): Money {
    if (!Number.isInteger(factor)) {
      throw new Error(
        `Money can only be multiplied by an integer, got ${factor}`,
      );
    }
    return Money.fromMinor(this.minor * factor);
  }

  isZero(): boolean {
    return this.minor === 0;
  }

  isNegative(): boolean {
    return this.minor < 0;
  }

  isPositive(): boolean {
    return this.minor > 0;
  }

  greaterThan(other: Money): boolean {
    return this.minor > other.minor;
  }

  greaterThanOrEqual(other: Money): boolean {
    return this.minor >= other.minor;
  }

  lessThan(other: Money): boolean {
    return this.minor < other.minor;
  }

  equals(other: Money): boolean {
    return this.minor === other.minor;
  }

  /** Clamp to a non-negative value (used when computing remaining balances). */
  clampToZero(): Money {
    return this.minor < 0 ? Money.ZERO : this;
  }

  /** Canonical persistence form. */
  toString(): string {
    return this.minor.toString();
  }

  toJSON(): number {
    return this.minor;
  }
}
