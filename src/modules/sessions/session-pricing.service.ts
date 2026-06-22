import { Injectable } from '@nestjs/common';
import { Money } from '../../common/money/money';
import { Session, SessionType } from './entities/session.entity';
import { BusinessRuleException } from '../../common/exceptions/domain.exception';

export interface PricingPlan {
  plannedEndAt: Date | null;
  /** Charge known up-front for fixed types; Money.ZERO for OPEN_SESSION. */
  plannedAmount: Money;
}

const SECONDS_PER_MINUTE = 60;

/**
 * Pure, deterministic pricing engine. It performs no I/O and holds no
 * state, so its output depends only on its inputs — which makes the money
 * math trivially testable and identical on every node.
 *
 * All amounts are integer minor units via the Money value object; there is
 * no floating point anywhere in the charge calculation.
 */
@Injectable()
export class SessionPricingService {
  /**
   * Computes the schedule and (for fixed types) the locked charge at the
   * moment a session starts.
   */
  plan(
    type: SessionType,
    ratePerHour: number,
    startedAt: Date,
    params: { durationMinutes?: number; plannedEndAt?: Date },
  ): PricingPlan {
    switch (type) {
      case SessionType.FIXED_DURATION: {
        const minutes = params.durationMinutes;
        if (!minutes || minutes <= 0) {
          throw new BusinessRuleException(
            'INVALID_DURATION',
            'FIXED_DURATION requires a positive durationMinutes',
          );
        }
        const seconds = minutes * SECONDS_PER_MINUTE;
        return {
          plannedEndAt: new Date(startedAt.getTime() + seconds * 1000),
          plannedAmount: Money.forDuration(ratePerHour, seconds),
        };
      }

      case SessionType.FIXED_END_TIME: {
        const end = params.plannedEndAt;
        if (!end) {
          throw new BusinessRuleException(
            'INVALID_END_TIME',
            'FIXED_END_TIME requires plannedEndAt',
          );
        }
        const seconds = this.diffSeconds(startedAt, end);
        if (seconds <= 0) {
          throw new BusinessRuleException(
            'INVALID_END_TIME',
            'plannedEndAt must be after the start time',
          );
        }
        return {
          plannedEndAt: end,
          plannedAmount: Money.forDuration(ratePerHour, seconds),
        };
      }

      case SessionType.OPEN_SESSION:
        return { plannedEndAt: null, plannedAmount: Money.ZERO };

      default:
        throw new BusinessRuleException('INVALID_SESSION_TYPE', 'Unknown type');
    }
  }

  /**
   * Live charge for an in-progress session at instant `now`.
   *  - Fixed types are prepaid: the planned amount is the charge.
   *  - OPEN_SESSION accrues from start to now.
   */
  quote(session: Session, now: Date): Money {
    if (session.type === SessionType.OPEN_SESSION) {
      const seconds = this.diffSeconds(session.startedAt, now);
      return Money.forDuration(session.ratePerHour, Math.max(seconds, 0));
    }
    return Money.fromMinor(session.amountDue);
  }

  /**
   * Final charge when a session ends at `endedAt`.
   *  - Fixed types: the locked planned amount (prepaid, no proration on
   *    early end — this is the club's billing policy and is explicit here).
   *  - OPEN_SESSION: accrued from start to the actual end time.
   */
  finalize(session: Session, endedAt: Date): Money {
    if (session.type === SessionType.OPEN_SESSION) {
      const seconds = this.diffSeconds(session.startedAt, endedAt);
      return Money.forDuration(session.ratePerHour, Math.max(seconds, 0));
    }
    return Money.fromMinor(session.amountDue);
  }

  /**
   * Recomputes schedule/charge when a fixed session is extended.
   * OPEN_SESSION cannot be "extended" — it has no fixed boundary.
   */
  extend(
    session: Session,
    params: { addMinutes?: number; newEndAt?: Date },
  ): PricingPlan {
    switch (session.type) {
      case SessionType.FIXED_DURATION: {
        if (!params.addMinutes || params.addMinutes <= 0) {
          throw new BusinessRuleException(
            'INVALID_EXTENSION',
            'FIXED_DURATION extension requires positive addMinutes',
          );
        }
        const base = session.plannedEndAt ?? session.startedAt;
        const newEnd = new Date(
          base.getTime() + params.addMinutes * SECONDS_PER_MINUTE * 1000,
        );
        const totalSeconds = this.diffSeconds(session.startedAt, newEnd);
        return {
          plannedEndAt: newEnd,
          plannedAmount: Money.forDuration(session.ratePerHour, totalSeconds),
        };
      }

      case SessionType.FIXED_END_TIME: {
        if (!params.newEndAt) {
          throw new BusinessRuleException(
            'INVALID_EXTENSION',
            'FIXED_END_TIME extension requires newEndAt',
          );
        }
        if (
          session.plannedEndAt &&
          params.newEndAt.getTime() <= session.plannedEndAt.getTime()
        ) {
          throw new BusinessRuleException(
            'INVALID_EXTENSION',
            'newEndAt must be later than the current planned end',
          );
        }
        const totalSeconds = this.diffSeconds(
          session.startedAt,
          params.newEndAt,
        );
        return {
          plannedEndAt: params.newEndAt,
          plannedAmount: Money.forDuration(session.ratePerHour, totalSeconds),
        };
      }

      default:
        throw new BusinessRuleException(
          'CANNOT_EXTEND',
          'OPEN_SESSION cannot be extended; simply end it when finished',
        );
    }
  }

  private diffSeconds(from: Date, to: Date): number {
    return Math.round((to.getTime() - from.getTime()) / 1000);
  }
}
