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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebtTransaction = exports.DebtTransactionType = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../../common/entities/base.entity");
const money_transformer_1 = require("../../../common/money/money.transformer");
const customer_entity_1 = require("../../customers/entities/customer.entity");
var DebtTransactionType;
(function (DebtTransactionType) {
    DebtTransactionType["DEBT_ADD"] = "DEBT_ADD";
    DebtTransactionType["DEBT_PAYMENT"] = "DEBT_PAYMENT";
    DebtTransactionType["DEBT_CORRECTION"] = "DEBT_CORRECTION";
})(DebtTransactionType || (exports.DebtTransactionType = DebtTransactionType = {}));
let DebtTransaction = class DebtTransaction extends base_entity_1.BaseEntity {
    customerId;
    customer;
    type;
    signedAmount;
    sessionId;
    actorId;
    reason;
};
exports.DebtTransaction = DebtTransaction;
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_id', type: 'uuid' }),
    __metadata("design:type", String)
], DebtTransaction.prototype, "customerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => customer_entity_1.Customer, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'customer_id' }),
    __metadata("design:type", customer_entity_1.Customer)
], DebtTransaction.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: DebtTransactionType }),
    __metadata("design:type", String)
], DebtTransaction.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'signed_amount',
        type: 'bigint',
        transformer: money_transformer_1.moneyColumnTransformer,
    }),
    __metadata("design:type", Number)
], DebtTransaction.prototype, "signedAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'session_id', type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], DebtTransaction.prototype, "sessionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'actor_id', type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], DebtTransaction.prototype, "actorId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], DebtTransaction.prototype, "reason", void 0);
exports.DebtTransaction = DebtTransaction = __decorate([
    (0, typeorm_1.Entity)('debt_transactions'),
    (0, typeorm_1.Index)('idx_debt_customer', ['customerId']),
    (0, typeorm_1.Index)('idx_debt_customer_created', ['customerId', 'createdAt'])
], DebtTransaction);
//# sourceMappingURL=debt-transaction.entity.js.map