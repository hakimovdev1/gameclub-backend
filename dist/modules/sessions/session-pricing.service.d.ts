import { Money } from '../../common/money/money';
import { Session, SessionType } from './entities/session.entity';
export interface PricingPlan {
    plannedEndAt: Date | null;
    plannedAmount: Money;
}
export declare class SessionPricingService {
    plan(type: SessionType, ratePerHour: number, startedAt: Date, params: {
        durationMinutes?: number;
        plannedEndAt?: Date;
    }): PricingPlan;
    quote(session: Session, now: Date): Money;
    finalize(session: Session, endedAt: Date): Money;
    extend(session: Session, params: {
        addMinutes?: number;
        newEndAt?: Date;
    }): PricingPlan;
    private diffSeconds;
}
