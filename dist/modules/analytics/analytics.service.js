"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const typeorm_2 = require("typeorm");
const session_entity_1 = require("../sessions/entities/session.entity");
const computer_entity_1 = require("../computers/entities/computer.entity");
const customer_entity_1 = require("../customers/entities/customer.entity");
const debt_service_1 = require("../debt/debt.service");
const cache_service_1 = require("../../common/cache/cache.service");
const realtime_events_1 = require("../realtime/realtime.events");
const CACHE_TTL_SECONDS = 30;
const CACHE_PREFIX = 'analytics:summary:';
let AnalyticsService = class AnalyticsService {
    sessions;
    computers;
    customers;
    debt;
    cache;
    events;
    constructor(sessions, computers, customers, debt, cache, events) {
        this.sessions = sessions;
        this.computers = computers;
        this.customers = customers;
        this.debt = debt;
        this.cache = cache;
        this.events = events;
    }
    onFinancialChange() {
        this.invalidate();
        this.events.emit(realtime_events_1.DomainEvent.AnalyticsUpdated, (0, realtime_events_1.buildEvent)(realtime_events_1.DomainEvent.AnalyticsUpdated, { invalidatedAt: new Date() }));
    }
    async summary(range) {
        const key = `${CACHE_PREFIX}${range.from.toISOString()}:${range.to.toISOString()}`;
        return this.cache.getOrSet(key, CACHE_TTL_SECONDS, () => this.computeSummary(range));
    }
    invalidate() {
        this.cache.delByPrefix(CACHE_PREFIX);
    }
    async computeSummary(range) {
        const base = () => this.sessions
            .createQueryBuilder('s')
            .where('s.status = :status', { status: session_entity_1.SessionStatus.ENDED })
            .andWhere('s.ended_at BETWEEN :from AND :to', {
            from: range.from,
            to: range.to,
        });
        const totals = await base()
            .select('COALESCE(SUM(s.amount_paid), 0)', 'revenue')
            .addSelect('COALESCE(SUM(EXTRACT(EPOCH FROM (s.ended_at - s.started_at))), 0)', 'playSeconds')
            .addSelect('COUNT(*)', 'sessionsCount')
            .addSelect('COUNT(DISTINCT s.customer_id)', 'uniqueCustomers')
            .getRawOne();
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
            .getRawMany();
        const topRoomsRaw = await base()
            .select('s.room_id', 'roomId')
            .addSelect('SUM(s.amount_paid)', 'revenue')
            .groupBy('s.room_id')
            .orderBy('revenue', 'DESC')
            .limit(5)
            .getRawMany();
        const [activeSessions, totalComputers, outstandingDebt] = await Promise.all([
            this.sessions.count({ where: { status: session_entity_1.SessionStatus.ACTIVE } }),
            this.computers.count({ where: { isActive: true } }),
            this.debt.getTotalOutstanding(),
        ]);
        return {
            range: { from: range.from.toISOString(), to: range.to.toISOString() },
            revenue,
            outstandingDebt: outstandingDebt.value,
            playSeconds,
            averageSessionSeconds: sessionsCount > 0 ? Math.round(playSeconds / sessionsCount) : 0,
            averageRevenuePerSession: sessionsCount > 0 ? Math.round(revenue / sessionsCount) : 0,
            sessionsCount,
            uniqueCustomers,
            activeSessions,
            occupancyRate: totalComputers > 0
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
};
exports.AnalyticsService = AnalyticsService;
__decorate([
    (0, event_emitter_1.OnEvent)(realtime_events_1.DomainEvent.SessionEnded),
    (0, event_emitter_1.OnEvent)(realtime_events_1.DomainEvent.DebtCreated),
    (0, event_emitter_1.OnEvent)(realtime_events_1.DomainEvent.DebtUpdated),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AnalyticsService.prototype, "onFinancialChange", null);
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(session_entity_1.Session)),
    __param(1, (0, typeorm_1.InjectRepository)(computer_entity_1.Computer)),
    __param(2, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        debt_service_1.DebtService,
        cache_service_1.CacheService,
        event_emitter_1.EventEmitter2])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map