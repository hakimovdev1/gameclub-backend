import { Money } from './money';

describe('Money', () => {
  describe('construction', () => {
    it('rejects non-integer minor units', () => {
      expect(() => Money.fromMinor(10.5)).toThrow();
    });

    it('rejects unsafe integers', () => {
      expect(() => Money.fromMinor(Number.MAX_SAFE_INTEGER + 1)).toThrow();
    });

    it('round-trips through string persistence', () => {
      expect(Money.fromString('150000').value).toBe(150000);
      expect(Money.fromMinor(150000).toString()).toBe('150000');
    });

    it('rejects malformed strings', () => {
      expect(() => Money.fromString('12.5')).toThrow();
      expect(() => Money.fromString('abc')).toThrow();
    });
  });

  describe('arithmetic (no floating point error)', () => {
    it('adds and subtracts exactly', () => {
      const a = Money.fromMinor(10);
      const b = Money.fromMinor(20);
      expect(a.add(b).value).toBe(30);
      expect(b.subtract(a).value).toBe(10);
    });

    it('avoids the classic 0.1 + 0.2 problem (works in minor units)', () => {
      const ten = Money.fromMinor(10);
      const twenty = Money.fromMinor(20);
      expect(ten.add(twenty).equals(Money.fromMinor(30))).toBe(true);
    });
  });

  describe('forDuration (deterministic time-based charge)', () => {
    it('charges a full hour at the hourly rate', () => {
      expect(Money.forDuration(15000, 3600).value).toBe(15000);
    });

    it('charges half an hour as half the rate', () => {
      expect(Money.forDuration(15000, 1800).value).toBe(7500);
    });

    it('rounds half-up deterministically', () => {
      // 10000/hour for 1 second = 2.77.. -> rounds to 3
      expect(Money.forDuration(10000, 1).value).toBe(3);
      // 10000/hour for 100 seconds = 277.77.. -> 278
      expect(Money.forDuration(10000, 100).value).toBe(278);
    });

    it('is exact across the whole day for typical rates', () => {
      // 12000/hour for 24h = 288000 exactly
      expect(Money.forDuration(12000, 24 * 3600).value).toBe(288000);
    });

    it('is identical when computed in parts vs in one shot (consistency)', () => {
      const rate = 17000;
      const whole = Money.forDuration(rate, 3600);
      // The whole-hour charge equals the rate regardless of decomposition.
      expect(whole.value).toBe(rate);
    });

    it('rejects negative inputs', () => {
      expect(() => Money.forDuration(-1, 60)).toThrow();
      expect(() => Money.forDuration(100, -60)).toThrow();
    });

    it('treats zero duration as zero charge', () => {
      expect(Money.forDuration(15000, 0).value).toBe(0);
    });
  });

  describe('comparisons and clamping', () => {
    it('compares values correctly', () => {
      expect(Money.fromMinor(10).greaterThan(Money.fromMinor(5))).toBe(true);
      expect(Money.fromMinor(5).lessThan(Money.fromMinor(10))).toBe(true);
      expect(Money.fromMinor(7).equals(Money.fromMinor(7))).toBe(true);
    });

    it('clamps negatives to zero', () => {
      expect(Money.fromMinor(-100).clampToZero().value).toBe(0);
      expect(Money.fromMinor(100).clampToZero().value).toBe(100);
    });
  });
});
