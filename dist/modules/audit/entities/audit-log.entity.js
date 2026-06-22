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
exports.AuditLog = void 0;
const typeorm_1 = require("typeorm");
let AuditLog = class AuditLog {
    id;
    actorId;
    actorEmail;
    action;
    entity;
    entityId;
    oldValue;
    newValue;
    ipAddress;
    userAgent;
    requestId;
    createdAt;
};
exports.AuditLog = AuditLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AuditLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'actor_id', type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], AuditLog.prototype, "actorId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'actor_email', type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], AuditLog.prototype, "actorEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 64 }),
    __metadata("design:type", String)
], AuditLog.prototype, "action", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 64 }),
    __metadata("design:type", String)
], AuditLog.prototype, "entity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'entity_id', type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], AuditLog.prototype, "entityId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'old_value', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], AuditLog.prototype, "oldValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'new_value', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], AuditLog.prototype, "newValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ip_address', type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], AuditLog.prototype, "ipAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_agent', type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], AuditLog.prototype, "userAgent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'request_id', type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], AuditLog.prototype, "requestId", void 0);
__decorate([
    (0, typeorm_1.Index)('idx_audit_created_at'),
    (0, typeorm_1.Column)({
        name: 'created_at',
        type: 'timestamptz',
        default: () => 'now()',
    }),
    __metadata("design:type", Date)
], AuditLog.prototype, "createdAt", void 0);
exports.AuditLog = AuditLog = __decorate([
    (0, typeorm_1.Entity)('audit_logs'),
    (0, typeorm_1.Index)('idx_audit_entity', ['entity', 'entityId']),
    (0, typeorm_1.Index)('idx_audit_actor', ['actorId']),
    (0, typeorm_1.Index)('idx_audit_created', ['createdAt'])
], AuditLog);
//# sourceMappingURL=audit-log.entity.js.map