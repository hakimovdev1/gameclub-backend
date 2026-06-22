"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Money = void 0;
class Money {
    minor;
    constructor(minor) {
        this.minor = minor;
    }
    static ZERO = new Money(0);
    static fromMinor(value) {
        if (!Number.isInteger(value)) {
            throw new Error(`Money requires an integer amount, received ${value}`);
        }
        if (!Number.isSafeInteger(value)) {
            throw new Error(`Money amount ${value} exceeds the safe integer range`);
        }
        return new Money(value);
    }
    static fromString(value) {
        if (!/^-?\d+$/.test(value)) {
            throw new Error(`Cannot parse Money from "${value}"`);
        }
        return Money.fromMinor(Number(value));
    }
    static forDuration(ratePerHourMinor, durationSeconds) {
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
        const denominator = 3600;
        const rounded = Math.floor((numerator * 2 + denominator) / (denominator * 2));
        return Money.fromMinor(rounded);
    }
    get value() {
        return this.minor;
    }
    add(other) {
        return Money.fromMinor(this.minor + other.minor);
    }
    subtract(other) {
        return Money.fromMinor(this.minor - other.minor);
    }
    multiply(factor) {
        if (!Number.isInteger(factor)) {
            throw new Error(`Money can only be multiplied by an integer, got ${factor}`);
        }
        return Money.fromMinor(this.minor * factor);
    }
    isZero() {
        return this.minor === 0;
    }
    isNegative() {
        return this.minor < 0;
    }
    isPositive() {
        return this.minor > 0;
    }
    greaterThan(other) {
        return this.minor > other.minor;
    }
    greaterThanOrEqual(other) {
        return this.minor >= other.minor;
    }
    lessThan(other) {
        return this.minor < other.minor;
    }
    equals(other) {
        return this.minor === other.minor;
    }
    clampToZero() {
        return this.minor < 0 ? Money.ZERO : this;
    }
    toString() {
        return this.minor.toString();
    }
    toJSON() {
        return this.minor;
    }
}
exports.Money = Money;
//# sourceMappingURL=money.js.map