export declare class Money {
    private readonly minor;
    private constructor();
    static readonly ZERO: Money;
    static fromMinor(value: number): Money;
    static fromString(value: string): Money;
    static forDuration(ratePerHourMinor: number, durationSeconds: number): Money;
    get value(): number;
    add(other: Money): Money;
    subtract(other: Money): Money;
    multiply(factor: number): Money;
    isZero(): boolean;
    isNegative(): boolean;
    isPositive(): boolean;
    greaterThan(other: Money): boolean;
    greaterThanOrEqual(other: Money): boolean;
    lessThan(other: Money): boolean;
    equals(other: Money): boolean;
    clampToZero(): Money;
    toString(): string;
    toJSON(): number;
}
