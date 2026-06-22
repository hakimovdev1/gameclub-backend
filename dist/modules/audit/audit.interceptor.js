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
exports.AuditInterceptor = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const operators_1 = require("rxjs/operators");
const audit_decorator_1 = require("./audit.decorator");
const audit_service_1 = require("./audit.service");
const request_id_middleware_1 = require("../../common/middleware/request-id.middleware");
let AuditInterceptor = class AuditInterceptor {
    reflector;
    audit;
    constructor(reflector, audit) {
        this.reflector = reflector;
        this.audit = audit;
    }
    intercept(context, next) {
        const meta = this.reflector.getAllAndOverride(audit_decorator_1.AUDIT_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!meta) {
            return next.handle();
        }
        const req = context.switchToHttp().getRequest();
        const user = req.user;
        const body = (req.body ?? {});
        return next.handle().pipe((0, operators_1.tap)((result) => {
            const entityId = this.extractId(result) ??
                req.params?.id ??
                null;
            void this.audit.record({
                actorId: user?.sub ?? null,
                actorEmail: user?.email ?? null,
                action: meta.action,
                entity: meta.entity,
                entityId,
                newValue: Object.keys(body).length ? body : result,
                ipAddress: req.ip ?? null,
                userAgent: req.headers['user-agent'] ?? null,
                requestId: (0, request_id_middleware_1.getRequestId)(req),
            });
        }));
    }
    extractId(result) {
        if (result && typeof result === 'object' && 'id' in result) {
            const id = result.id;
            return typeof id === 'string' ? id : null;
        }
        return null;
    }
};
exports.AuditInterceptor = AuditInterceptor;
exports.AuditInterceptor = AuditInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        audit_service_1.AuditService])
], AuditInterceptor);
//# sourceMappingURL=audit.interceptor.js.map