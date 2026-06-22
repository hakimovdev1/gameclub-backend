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
var AuditService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const audit_log_entity_1 = require("./entities/audit-log.entity");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
let AuditService = AuditService_1 = class AuditService {
    logs;
    logger = new common_1.Logger(AuditService_1.name);
    constructor(logs) {
        this.logs = logs;
    }
    async record(entry) {
        try {
            const record = this.logs.create({
                actorId: entry.actorId ?? null,
                actorEmail: entry.actorEmail ?? null,
                action: entry.action,
                entity: entry.entity,
                entityId: entry.entityId ?? null,
                oldValue: this.redact(entry.oldValue) ?? null,
                newValue: this.redact(entry.newValue) ?? null,
                ipAddress: entry.ipAddress ?? null,
                userAgent: entry.userAgent ?? null,
                requestId: entry.requestId ?? null,
            });
            await this.logs.save(record);
        }
        catch (err) {
            this.logger.error(`Failed to persist audit log for ${entry.action}/${entry.entity}`, err instanceof Error ? err.stack : String(err));
        }
    }
    async findAll(query) {
        const [items, total] = await this.logs.findAndCount({
            order: { createdAt: 'DESC' },
            skip: query.skip,
            take: query.limit,
        });
        return (0, pagination_dto_1.paginate)(items, total, query);
    }
    redact(value) {
        if (!value || typeof value !== 'object') {
            return value;
        }
        const sensitive = ['password', 'passwordHash', 'token', 'refreshToken'];
        if (Array.isArray(value)) {
            return value.map((item) => this.redact(item));
        }
        const clone = {
            ...value,
        };
        for (const key of Object.keys(clone)) {
            if (sensitive.includes(key)) {
                clone[key] = '[REDACTED]';
            }
        }
        return clone;
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = AuditService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(audit_log_entity_1.AuditLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AuditService);
//# sourceMappingURL=audit.service.js.map