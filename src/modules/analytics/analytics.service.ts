import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import { Session, SessionStatus } from '../sessions/entities/session.entity';
import { Computer } from '../computers/entities/computer.entity';
import { Customer } from '../customers/entities/customer.entity';
import { DebtService } from '../debt/debt.service';
import { CacheService } from '../../common/cache/cache.service';
import { DomainEvent, buildEvent } from '../realtime/realtime.events';

export interface AnalyticsRange {
  from: Date;
  to: Date;
}

export interface AnalyticsSummary {
  range: { from: string; to: string };
  revenue: number;
  outstandingDebt: number;
  playSeconds: number;
  averageSessionSeconds: number;
  averageRevenuePerSession: number;
  sessionsCount: number;
  uniqueCustomers: number;
  activeSessions: number;
  occupancyRate: number;
  topComputers: Array<{ computerId: string; label: string; revenue: number }>;
  topRooms: Array<{ roomId: string; revenue: number }>;
}

const CACHE_TTL_SECONDS = 30;
const CACHE_PREFIX = 'analytics:summary:';

/**
 * Read-side analytics. Every figure is produced by a single aggregation
 * query against the canonical tables (no derived counters to drift), and
 * the assembled summary is cached briefly so dashboards polling the
 * endpoint never hammer the database.
 */
@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Session)
    private readonly sessions: Repository<Session>,
    @InjectRepository(Computer)
    private readonly computers: Repository<Computer>,
    @InjectRepository(Customer)
    private readonly customers: Repository<Customer>,
    private readonly debt: DebtService,
    private readonly cache: CacheService,
    private readonly events: EventEmitter2,
  ) {}

  /**
   * When money-affecting events occur, drop cached summaries and notify
   * dashboards that fresh numbers are available (they then re-fetch).
   */
  @OnEvent(DomainEvent.SessionEnded)
  @OnEvent(DomainEvent.DebtCreated)
  @OnEvent(DomainEvent.DebtUpdated)
  onFinancialChange(): void {
    this.invalidate();
    this.events.emit(
      DomainEvent.AnalyticsUpdated,
      buildEvent(DomainEvent.AnalyticsUpdated, { invalidatedAt: new Date() }),
    );
  }

  async summary(range: AnalyticsRange): Promise<AnalyticsSummary> {
    const key = `${CACHE_PREFIX}${range.from.toISOString()}:${range.to.toISOString()}`;
    return this.cache.getOrSet(key, CACHE_TTL_SECONDS, () =>
      this.computeSummary(range),
    );
  }

  /** Invalidate cached summaries (called when financial state changes). */
  invalidate(): void {
    this.cache.delByPrefix(CACHE_PREFIX);
  }

  private async computeSummary(
    range: AnalyticsRange,
  ): Promise<AnalyticsSummary> {
    const base = () =>
      this.sessions
        .createQueryBuilder('s')
        .where('s.status = :status', { status: SessionStatus.ENDED })
        .andWhere('s.ended_at BETWEEN :from AND :to', {
          from: range.from,
          to: range.to,
        });

    const totals = await base()
      .select('COALESCE(SUM(s.amount_paid), 0)', 'revenue')
      .addSelect(
        'COALESCE(SUM(EXTRACT(EPOCH FROM (s.ended_at - s.started_at))), 0)',
        'playSeconds',
      )
      .addSelect('COUNT(*)', 'sessionsCount')
      .addSelect('COUNT(DISTINCT s.customer_id)', 'uniqueCustomers')
      .getRawOne<{
        revenue: string;
        playSeconds: string;
        sessionsCount: string;
        uniqueCustomers: string;
      }>();

    const revenue = Number(totals?.revenue ?? 0);
    const playSeconds = Math.round(Number(totals?.playSeconds ?? 0));
    const sessionsCount = Number(totals?.sessionsCount ?? 0);
    const uniqueCustomers = Number(totals?.uniqueCustomers ?? 0);

    const topComputersRaw = await base()
      .leftJoin('s.computer', 'c')
      .select('s.computer_id', 'computerId')
      .addSelect('MAX(c.label)', 'label')
      .addSelect('SUM(s.amount_paid)', 'revenue')
      .groupBy('s.computer_id')
      .orderBy('revenue', 'DESC')
      .limit(5)
      .getRawMany<{ computerId: string; label: string; revenue: string }>();

    const topRoomsRaw = await base()
      .select('s.room_id', 'roomId')
      .addSelect('SUM(s.amount_paid)', 'revenue')
      .groupBy('s.room_id')
      .orderBy('revenue', 'DESC')
      .limit(5)
      .getRawMany<{ roomId: string; revenue: string }>();

    const [activeSessions, totalComputers, outstandingDebt] = await Promise.all(
      [
        this.sessions.count({ where: { status: SessionStatus.ACTIVE } }),
        this.computers.count({ where: { isActive: true } }),
        this.debt.getTotalOutstanding(),
      ],
    );

    return {
      range: { from: range.from.toISOString(), to: range.to.toISOString() },
      revenue,
      outstandingDebt: outstandingDebt.value,
      playSeconds,
      averageSessionSeconds:
        sessionsCount > 0 ? Math.round(playSeconds / sessionsCount) : 0,
      averageRevenuePerSession:
        sessionsCount > 0 ? Math.round(revenue / sessionsCount) : 0,
      sessionsCount,
      uniqueCustomers,
      activeSessions,
      occupancyRate:
        totalComputers > 0
          ? Math.round((activeSessions / totalComputers) * 10000) / 100
          : 0,
      topComputers: topComputersRaw.map((r) => ({
        computerId: r.computerId,
        label: r.label,
        revenue: Number(r.revenue),
      })),
      topRooms: topRoomsRaw.map((r) => ({
        roomId: r.roomId,
        revenue: Number(r.revenue),
      })),
    };
  }
}
