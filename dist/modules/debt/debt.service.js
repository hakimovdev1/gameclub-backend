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
exports.DebtService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const customer_entity_1 = require("../customers/entities/customer.entity");
const debt_transaction_entity_1 = require("./entities/debt-transaction.entity");
const money_1 = require("../../common/money/money");
const domain_exception_1 = require("../../common/exceptions/domain.exception");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const realtime_events_1 = require("../realtime/realtime.events");
let DebtService = class DebtService {
    ledger;
    dataSource;
    events;
    constructor(ledger, dataSource, events) {
        this.ledger = ledger;
        this.dataSource = dataSource;
        this.events = events;
    }
    async addDebt(input, manager) {
        const magnitude = money_1.Money.fromMinor(input.amount);
        if (!magnitude.isPositive()) {
            throw new domain_exception_1.BusinessRuleException('INVALID_DEBT_AMOUNT', 'Debt amount must be positive');
        }
        const entry = await this.insert({
            customerId: input.customerId,
            type: debt_transaction_entity_1.DebtTransactionType.DEBT_ADD,
            signedAmount: magnitude.value,
            sessionId: input.sessionId ?? null,
            actorId: input.actorId ?? null,
            reason: input.reason ?? null,
        }, manager);
        if (!manager) {
            await this.emitAfterChange(input.customerId, realtime_events_1.DomainEvent.DebtCreated, entry);
        }
        return entry;
    }
    async recordPayment(input) {
        const magnitude = money_1.Money.fromMinor(input.amount);
        if (!magnitude.isPositive()) {
            throw new domain_exception_1.BusinessRuleException('INVALID_PAYMENT_AMOUNT', 'Payment amount must be positive');
        }
        const entry = await this.dataSource.transaction(async (manager) => {
            const customer = await manager.findOne(customer_entity_1.Customer, {
                where: { id: input.customerId },
                lock: { mode: 'pessimistic_write' },
            });
            if (!customer) {
                throw new domain_exception_1.BusinessRuleException('CUSTOMER_NOT_FOUND', 'Customer does not exist');
            }
            const balance = await this.getBalance(input.customerId, manager);
            if (magnitude.greaterThan(balance)) {
                throw new domain_exception_1.BusinessRuleException('OVERPAYMENT', 'Payment exceeds the outstanding balance', { balance: balance.value, attempted: magnitude.value });
            }
            return this.insert({
                customerId: input.customerId,
                type: debt_transaction_entity_1.DebtTransactionType.DEBT_PAYMENT,
                signedAmount: -magnitude.value,
                sessionId: input.sessionId ?? null,
                actorId: input.actorId ?? null,
                reason: input.reason ?? null,
            }, manager);
        });
        await this.emitAfterChange(input.customerId, realtime_events_1.DomainEvent.DebtUpdated, entry);
        return entry;
    }
    async announceDebtChange(customerId, entry) {
        await this.emitAfterChange(customerId, realtime_events_1.DomainEvent.DebtCreated, entry);
    }
    async correct(customerId, signedAmount, actorId, reason) {
        const value = money_1.Money.fromMinor(signedAmount);
        if (value.isZero()) {
            throw new domain_exception_1.BusinessRuleException('INVALID_CORRECTION', 'Correction amount cannot be zero');
        }
        const entry = await this.insert({
            customerId,
            type: debt_transaction_entity_1.DebtTransactionType.DEBT_CORRECTION,
            signedAmount: value.value,
            actorId,
            reason,
        });
        await this.emitAfterChange(customerId, realtime_events_1.DomainEvent.DebtUpdated, entry);
        return entry;
    }
    async getBalance(customerId, manager) {
        const repo = manager ? manager.getRepository(debt_transaction_entity_1.DebtTransaction) : this.ledger;
        const row = await repo
            .createQueryBuilder('t')
            .select('COALESCE(SUM(t.signed_amount), 0)', 'sum')
            .where('t.customer_id = :customerId', { customerId })
            .getRawOne();
        return money_1.Money.fromString(row?.sum ?? '0');
    }
    async getLedger(customerId, query) {
        const [items, total] = await this.ledger.findAndCount({
            where: { customerId },
            order: { createdAt: 'DESC' },
            skip: query.skip,
            take: query.limit,
        });
        return (0, pagination_dto_1.paginate)(items, total, query);
    }
    async getTotalOutstanding() {
        const row = await this.ledger
            .createQueryBuilder('t')
            .select('COALESCE(SUM(t.signed_amount), 0)', 'sum')
            .getRawOne();
        return money_1.Money.fromString(row?.sum ?? '0');
    }
    async insert(data, manager) {
        const repo = manager ? manager.getRepository(debt_transaction_entity_1.DebtTransaction) : this.ledger;
        return repo.save(repo.create(data));
    }
    async emitAfterChange(customerId, event, entry) {
        const balance = await this.getBalance(customerId);
        this.events.emit(event, (0, realtime_events_1.buildEvent)(event, {
            customerId,
            transactionId: entry.id,
            type: entry.type,
            signedAmount: entry.signedAmount,
            balance: balance.value,
        }));
    }
};
exports.DebtService = DebtService;
exports.DebtService = DebtService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(debt_transaction_entity_1.DebtTransaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.DataSource,
        event_emitter_1.EventEmitter2])
], DebtService);
//# sourceMappingURL=debt.service.js.map