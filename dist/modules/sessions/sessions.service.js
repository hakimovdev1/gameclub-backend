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
exports.SessionsService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto_1 = require("crypto");
const session_entity_1 = require("./entities/session.entity");
const computer_entity_1 = require("../computers/entities/computer.entity");
const room_entity_1 = require("../rooms/entities/room.entity");
const customer_entity_1 = require("../customers/entities/customer.entity");
const session_pricing_service_1 = require("./session-pricing.service");
const debt_service_1 = require("../debt/debt.service");
const money_1 = require("../../common/money/money");
const domain_exception_1 = require("../../common/exceptions/domain.exception");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const realtime_events_1 = require("../realtime/realtime.events");
let SessionsService = class SessionsService {
    sessions;
    dataSource;
    pricing;
    debt;
    events;
    constructor(sessions, dataSource, pricing, debt, events) {
        this.sessions = sessions;
        this.dataSource = dataSource;
        this.pricing = pricing;
        this.debt = debt;
        this.events = events;
    }
    async start(dto, ctx) {
        const startedAt = new Date();
        const isGroup = dto.computerIds.length > 1;
        const groupId = isGroup ? (0, crypto_1.randomUUID)() : null;
        const created = await this.dataSource.transaction(async (manager) => {
            const customer = await this.resolveCustomer(manager, dto.customerId);
            const results = [];
            for (const computerId of dto.computerIds) {
                const computer = await manager.findOne(computer_entity_1.Computer, {
                    where: { id: computerId },
                    lock: { mode: 'pessimistic_write' },
                });
                if (!computer) {
                    throw new domain_exception_1.ResourceNotFoundException('Computer', computerId);
                }
                if (!computer.isActive ||
                    computer.status !== computer_entity_1.ComputerStatus.AVAILABLE) {
                    throw new domain_exception_1.ConflictException('COMPUTER_NOT_AVAILABLE', `Computer ${computer.label} is not available`, { computerId, status: computer.status });
                }
                const room = await manager.findOne(room_entity_1.Room, {
                    where: { id: computer.roomId },
                });
                if (!room || !room.isActive) {
                    throw new domain_exception_1.BusinessRuleException('ROOM_INACTIVE', 'The room for this computer is inactive');
                }
                const plan = this.pricing.plan(dto.type, room.pricePerHour, startedAt, {
                    durationMinutes: dto.durationMinutes,
                    plannedEndAt: dto.plannedEndAt,
                });
                const session = manager.create(session_entity_1.Session, {
                    groupId,
                    computerId: computer.id,
                    roomId: room.id,
                    customerId: customer?.id ?? null,
                    type: dto.type,
                    status: session_entity_1.SessionStatus.ACTIVE,
                    ratePerHour: room.pricePerHour,
                    startedAt,
                    plannedEndAt: plan.plannedEndAt,
                    amountDue: plan.plannedAmount.value,
                    amountPaid: 0,
                    startedBy: ctx.actorId,
                    notes: dto.notes ?? null,
                });
                const saved = await manager.save(session);
                computer.status = computer_entity_1.ComputerStatus.IN_USE;
                await manager.save(computer);
                results.push(saved);
            }
            return results;
        });
        for (const session of created) {
            this.events.emit(realtime_events_1.DomainEvent.SessionStarted, (0, realtime_events_1.buildEvent)(realtime_events_1.DomainEvent.SessionStarted, this.toEvent(session)));
        }
        return created;
    }
    async extend(id, dto) {
        const updated = await this.dataSource.transaction(async (manager) => {
            const session = await this.lockActive(manager, id);
            const plan = this.pricing.extend(session, {
                addMinutes: dto.addMinutes,
                newEndAt: dto.newEndAt,
            });
            session.plannedEndAt = plan.plannedEndAt;
            session.amountDue = plan.plannedAmount.value;
            return manager.save(session);
        });
        this.events.emit(realtime_events_1.DomainEvent.SessionExtended, (0, realtime_events_1.buildEvent)(realtime_events_1.DomainEvent.SessionExtended, this.toEvent(updated)));
        return updated;
    }
    async end(id, dto, ctx) {
        const endedAt = new Date();
        const { session: result, debtEntry } = await this.dataSource.transaction(async (manager) => {
            const session = await this.lockActive(manager, id);
            const due = this.pricing.finalize(session, endedAt);
            const paid = money_1.Money.fromMinor(dto.amountPaid);
            if (paid.greaterThan(due)) {
                throw new domain_exception_1.BusinessRuleException('OVERPAYMENT', 'Amount paid exceeds the amount due; give change instead', { due: due.value, paid: paid.value });
            }
            const shortfall = due.subtract(paid);
            if (shortfall.isPositive() && !session.customerId) {
                throw new domain_exception_1.BusinessRuleException('DEBT_REQUIRES_CUSTOMER', 'Cannot leave an unpaid balance without an attached customer', { due: due.value, paid: paid.value });
            }
            session.status = session_entity_1.SessionStatus.ENDED;
            session.endedAt = endedAt;
            session.amountDue = due.value;
            session.amountPaid = paid.value;
            session.endedBy = ctx.actorId;
            if (dto.notes) {
                session.notes = dto.notes;
            }
            const saved = await manager.save(session);
            let debt = null;
            if (shortfall.isPositive() && session.customerId) {
                debt = await this.debt.addDebt({
                    customerId: session.customerId,
                    amount: shortfall.value,
                    sessionId: session.id,
                    actorId: ctx.actorId,
                    reason: `Unpaid balance for session ${session.id}`,
                }, manager);
            }
            await this.releaseComputer(manager, session.computerId);
            return { session: saved, debtEntry: debt };
        });
        this.events.emit(realtime_events_1.DomainEvent.SessionEnded, (0, realtime_events_1.buildEvent)(realtime_events_1.DomainEvent.SessionEnded, this.toEvent(result)));
        if (debtEntry && result.customerId) {
            await this.debt.announceDebtChange(result.customerId, debtEntry);
        }
        return result;
    }
    async cancel(id, ctx) {
        const result = await this.dataSource.transaction(async (manager) => {
            const session = await this.lockActive(manager, id);
            session.status = session_entity_1.SessionStatus.CANCELLED;
            session.endedAt = new Date();
            session.amountDue = 0;
            session.amountPaid = 0;
            session.endedBy = ctx.actorId;
            const saved = await manager.save(session);
            await this.releaseComputer(manager, session.computerId);
            return saved;
        });
        this.events.emit(realtime_events_1.DomainEvent.SessionEnded, (0, realtime_events_1.buildEvent)(realtime_events_1.DomainEvent.SessionEnded, this.toEvent(result)));
        return result;
    }
    async quote(id) {
        const session = await this.findById(id);
        if (session.status !== session_entity_1.SessionStatus.ACTIVE) {
            return { amount: session.amountDue, at: new Date().toISOString() };
        }
        const amount = this.pricing.quote(session, new Date());
        return { amount: amount.value, at: new Date().toISOString() };
    }
    async findById(id) {
        const session = await this.sessions.findOne({
            where: { id },
            relations: { computer: true, customer: true },
        });
        if (!session) {
            throw new domain_exception_1.ResourceNotFoundException('Session', id);
        }
        return session;
    }
    async findAll(query, filters = {}) {
        const [items, total] = await this.sessions.findAndCount({
            where: {
                ...(filters.status ? { status: filters.status } : {}),
                ...(filters.customerId ? { customerId: filters.customerId } : {}),
            },
            relations: { computer: true, customer: true },
            order: { startedAt: 'DESC' },
            skip: query.skip,
            take: query.limit,
        });
        return (0, pagination_dto_1.paginate)(items, total, query);
    }
    async findActive() {
        return this.sessions.find({
            where: { status: session_entity_1.SessionStatus.ACTIVE },
            relations: { computer: true, customer: true },
            order: { startedAt: 'ASC' },
        });
    }
    async resolveCustomer(manager, customerId) {
        if (!customerId) {
            return null;
        }
        const customer = await manager.findOne(customer_entity_1.Customer, {
            where: { id: customerId },
        });
        if (!customer) {
            throw new domain_exception_1.ResourceNotFoundException('Customer', customerId);
        }
        if (customer.isBlocked) {
            throw new domain_exception_1.BusinessRuleException('CUSTOMER_BLOCKED', 'This customer is blocked and cannot start sessions');
        }
        return customer;
    }
    async lockActive(manager, id) {
        const session = await manager.findOne(session_entity_1.Session, {
            where: { id },
            lock: { mode: 'pessimistic_write' },
        });
        if (!session) {
            throw new domain_exception_1.ResourceNotFoundException('Session', id);
        }
        if (session.status !== session_entity_1.SessionStatus.ACTIVE) {
            throw new domain_exception_1.ConflictException('SESSION_NOT_ACTIVE', `Session is ${session.status} and cannot be modified`);
        }
        return session;
    }
    async releaseComputer(manager, computerId) {
        const computer = await manager.findOne(computer_entity_1.Computer, {
            where: { id: computerId },
            lock: { mode: 'pessimistic_write' },
        });
        if (computer && computer.status === computer_entity_1.ComputerStatus.IN_USE) {
            computer.status = computer_entity_1.ComputerStatus.AVAILABLE;
            await manager.save(computer);
        }
    }
    toEvent(session) {
        return {
            id: session.id,
            groupId: session.groupId,
            computerId: session.computerId,
            customerId: session.customerId,
            type: session.type,
            status: session.status,
            startedAt: session.startedAt,
            plannedEndAt: session.plannedEndAt,
            endedAt: session.endedAt,
            amountDue: session.amountDue,
            amountPaid: session.amountPaid,
        };
    }
};
exports.SessionsService = SessionsService;
exports.SessionsService = SessionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(session_entity_1.Session)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.DataSource,
        session_pricing_service_1.SessionPricingService,
        debt_service_1.DebtService,
        event_emitter_1.EventEmitter2])
], SessionsService);
//# sourceMappingURL=sessions.service.js.map