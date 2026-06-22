import { SessionPricingService } from './session-pricing.service';
import { Session, SessionType } from './entities/session.entity';

describe('SessionPricingService', () => {
  const pricing = new SessionPricingService();
  const start = new Date('2026-01-01T10:00:00.000Z');

  describe('plan', () => {
    it('prices FIXED_DURATION up front from minutes', () => {
      const plan = pricing.plan(SessionType.FIXED_DURATION, 12000, start, {
        durationMinutes: 90,
      });
      // 12000/hour * 1.5h = 18000
      expect(plan.plannedAmount.value).toBe(18000);
      expect(plan.plannedEndAt?.toISOString()).toBe('2026-01-01T11:30:00.000Z');
    });

    it('prices FIXED_END_TIME from the interval', () => {
      const end = new Date('2026-01-01T12:00:00.000Z');
      const plan = pricing.plan(SessionType.FIXED_END_TIME, 10000, start, {
        plannedEndAt: end,
      });
      // 2 hours at 10000 = 20000
      expect(plan.plannedAmount.value).toBe(20000);
    });

    it('leaves OPEN_SESSION unpriced at start', () => {
      const plan = pricing.plan(SessionType.OPEN_SESSION, 10000, start, {});
      expect(plan.plannedAmount.value).toBe(0);
      expect(plan.plannedEndAt).toBeNull();
    });

    it('rejects FIXED_DURATION without minutes', () => {
      expect(() =>
        pricing.plan(SessionType.FIXED_DURATION, 10000, start, {}),
      ).toThrow();
    });

    it('rejects FIXED_END_TIME in the past', () => {
      expect(() =>
        pricing.plan(SessionType.FIXED_END_TIME, 10000, start, {
          plannedEndAt: new Date('2026-01-01T09:00:00.000Z'),
        }),
      ).toThrow();
    });
  });

  describe('finalize', () => {
    it('accrues OPEN_SESSION to the actual end time', () => {
      const session = {
        type: SessionType.OPEN_SESSION,
        ratePerHour: 18000,
        startedAt: start,
        amountDue: 0,
      } as Session;
      const end = new Date('2026-01-01T10:20:00.000Z'); // 20 minutes
      // 18000/hour * (1/3)h = 6000
      expect(pricing.finalize(session, end).value).toBe(6000);
    });

    it('keeps the locked amount for fixed sessions (prepaid policy)', () => {
      const session = {
        type: SessionType.FIXED_DURATION,
        ratePerHour: 12000,
        startedAt: start,
        amountDue: 18000,
      } as Session;
      // Ending early does not refund a prepaid fixed session.
      const end = new Date('2026-01-01T10:30:00.000Z');
      expect(pricing.finalize(session, end).value).toBe(18000);
    });
  });

  describe('extend', () => {
    it('recomputes FIXED_DURATION total charge', () => {
      const session = {
        type: SessionType.FIXED_DURATION,
        ratePerHour: 12000,
        startedAt: start,
        plannedEndAt: new Date('2026-01-01T11:00:00.000Z'),
        amountDue: 12000,
      } as Session;
      const plan = pricing.extend(session, { addMinutes: 30 });
      // total 1.5h at 12000 = 18000
      expect(plan.plannedAmount.value).toBe(18000);
      expect(plan.plannedEndAt?.toISOString()).toBe('2026-01-01T11:30:00.000Z');
    });

    it('refuses to extend an OPEN_SESSION', () => {
      const session = {
        type: SessionType.OPEN_SESSION,
        ratePerHour: 12000,
        startedAt: start,
      } as Session;
      expect(() => pricing.extend(session, { addMinutes: 30 })).toThrow();
    });
  });
});
