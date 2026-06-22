import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import { Session } from '../sessions/entities/session.entity';
import { Computer } from '../computers/entities/computer.entity';
import { Customer } from '../customers/entities/customer.entity';
import { DebtService } from '../debt/debt.service';
import { CacheService } from '../../common/cache/cache.service';
export interface AnalyticsRange {
    from: Date;
    to: Date;
}
export interface AnalyticsSummary {
    range: {
        from: string;
        to: string;
    };
    revenue: number;
    outstandingDebt: number;
    playSeconds: number;
    averageSessionSeconds: number;
    averageRevenuePerSession: number;
    sessionsCount: number;
    uniqueCustomers: number;
    activeSessions: number;
    occupancyRate: number;
    topComputers: Array<{
        computerId: string;
        label: string;
        revenue: number;
    }>;
    topRooms: Array<{
        roomId: string;
        revenue: number;
    }>;
}
export declare class AnalyticsService {
    private readonly sessions;
    private readonly computers;
    private readonly customers;
    private readonly debt;
    private readonly cache;
    private readonly events;
    constructor(sessions: Repository<Session>, computers: Repository<Computer>, customers: Repository<Customer>, debt: DebtService, cache: CacheService, events: EventEmitter2);
    onFinancialChange(): void;
    summary(range: AnalyticsRange): Promise<AnalyticsSummary>;
    invalidate(): void;
    private computeSummary;
}
