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
exports.Session = exports.SessionStatus = exports.SessionType = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../../common/entities/base.entity");
const money_transformer_1 = require("../../../common/money/money.transformer");
const computer_entity_1 = require("../../computers/entities/computer.entity");
const customer_entity_1 = require("../../customers/entities/customer.entity");
var SessionType;
(function (SessionType) {
    SessionType["FIXED_DURATION"] = "FIXED_DURATION";
    SessionType["FIXED_END_TIME"] = "FIXED_END_TIME";
    SessionType["OPEN_SESSION"] = "OPEN_SESSION";
})(SessionType || (exports.SessionType = SessionType = {}));
var SessionStatus;
(function (SessionStatus) {
    SessionStatus["ACTIVE"] = "ACTIVE";
    SessionStatus["ENDED"] = "ENDED";
    SessionStatus["CANCELLED"] = "CANCELLED";
})(SessionStatus || (exports.SessionStatus = SessionStatus = {}));
let Session = class Session extends base_entity_1.BaseEntity {
    groupId;
    computerId;
    computer;
    roomId;
    customerId;
    customer;
    type;
    status;
    ratePerHour;
    startedAt;
    plannedEndAt;
    endedAt;
    amountDue;
    amountPaid;
    startedBy;
    endedBy;
    notes;
};
exports.Session = Session;
__decorate([
    (0, typeorm_1.Column)({ name: 'group_id', type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], Session.prototype, "groupId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'computer_id', type: 'uuid' }),
    __metadata("design:type", String)
], Session.prototype, "computerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => computer_entity_1.Computer, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'computer_id' }),
    __metadata("design:type", computer_entity_1.Computer)
], Session.prototype, "computer", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'room_id', type: 'uuid' }),
    __metadata("design:type", String)
], Session.prototype, "roomId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_id', type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], Session.prototype, "customerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => customer_entity_1.Customer, { onDelete: 'RESTRICT', nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'customer_id' }),
    __metadata("design:type", Object)
], Session.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: SessionType }),
    __metadata("design:type", String)
], Session.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: SessionStatus, default: SessionStatus.ACTIVE }),
    __metadata("design:type", String)
], Session.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'rate_per_hour',
        type: 'bigint',
        transformer: money_transformer_1.moneyColumnTransformer,
    }),
    __metadata("design:type", Number)
], Session.prototype, "ratePerHour", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'started_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], Session.prototype, "startedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'planned_end_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], Session.prototype, "plannedEndAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ended_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], Session.prototype, "endedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'amount_due',
        type: 'bigint',
        default: '0',
        transformer: money_transformer_1.moneyColumnTransformer,
    }),
    __metadata("design:type", Number)
], Session.prototype, "amountDue", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'amount_paid',
        type: 'bigint',
        default: '0',
        transformer: money_transformer_1.moneyColumnTransformer,
    }),
    __metadata("design:type", Number)
], Session.prototype, "amountPaid", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'started_by', type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], Session.prototype, "startedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ended_by', type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], Session.prototype, "endedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], Session.prototype, "notes", void 0);
exports.Session = Session = __decorate([
    (0, typeorm_1.Entity)('sessions'),
    (0, typeorm_1.Index)('idx_session_status', ['status']),
    (0, typeorm_1.Index)('idx_session_group', ['groupId']),
    (0, typeorm_1.Index)('idx_session_customer', ['customerId']),
    (0, typeorm_1.Index)('idx_session_room', ['roomId']),
    (0, typeorm_1.Index)('idx_session_status_ended', ['status', 'endedAt']),
    (0, typeorm_1.Index)('uq_session_active_computer', ['computerId'], {
        unique: true,
        where: `"status" = 'ACTIVE'`,
    })
], Session);
//# sourceMappingURL=session.entity.js.map