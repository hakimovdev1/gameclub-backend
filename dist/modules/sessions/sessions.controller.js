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
exports.SessionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const sessions_service_1 = require("./sessions.service");
const start_session_dto_1 = require("./dto/start-session.dto");
const extend_session_dto_1 = require("./dto/extend-session.dto");
const end_session_dto_1 = require("./dto/end-session.dto");
const session_entity_1 = require("./entities/session.entity");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const role_enum_1 = require("../../common/enums/role.enum");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const audit_decorator_1 = require("../audit/audit.decorator");
let SessionsController = class SessionsController {
    sessions;
    constructor(sessions) {
        this.sessions = sessions;
    }
    start(dto, user) {
        return this.sessions.start(dto, { actorId: user.sub });
    }
    findAll(query, status, customerId) {
        return this.sessions.findAll(query, { status, customerId });
    }
    active() {
        return this.sessions.findActive();
    }
    findOne(id) {
        return this.sessions.findById(id);
    }
    quote(id) {
        return this.sessions.quote(id);
    }
    extend(id, dto) {
        return this.sessions.extend(id, dto);
    }
    end(id, dto, user) {
        return this.sessions.end(id, dto, { actorId: user.sub });
    }
    cancel(id, user) {
        return this.sessions.cancel(id, { actorId: user.sub });
    }
};
exports.SessionsController = SessionsController;
__decorate([
    (0, common_1.Post)(),
    (0, audit_decorator_1.Audited)('SESSION_START', 'Session'),
    (0, swagger_1.ApiOperation)({ summary: 'Start a session or an atomic group session' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [start_session_dto_1.StartSessionDto, Object]),
    __metadata("design:returntype", void 0)
], SessionsController.prototype, "start", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: session_entity_1.SessionStatus }),
    (0, swagger_1.ApiQuery)({ name: 'customerId', required: false }),
    (0, swagger_1.ApiOperation)({ summary: 'List sessions' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('customerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationQueryDto, String, String]),
    __metadata("design:returntype", void 0)
], SessionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('active'),
    (0, swagger_1.ApiOperation)({ summary: 'List currently active sessions' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SessionsController.prototype, "active", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a session' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SessionsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/quote'),
    (0, swagger_1.ApiOperation)({ summary: 'Live running cost of an active session' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SessionsController.prototype, "quote", null);
__decorate([
    (0, common_1.Post)(':id/extend'),
    (0, audit_decorator_1.Audited)('SESSION_EXTEND', 'Session'),
    (0, swagger_1.ApiOperation)({ summary: 'Extend a fixed session' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, extend_session_dto_1.ExtendSessionDto]),
    __metadata("design:returntype", void 0)
], SessionsController.prototype, "extend", null);
__decorate([
    (0, common_1.Post)(':id/end'),
    (0, audit_decorator_1.Audited)('SESSION_END', 'Session'),
    (0, swagger_1.ApiOperation)({ summary: 'End a session, take payment, settle debt' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, end_session_dto_1.EndSessionDto, Object]),
    __metadata("design:returntype", void 0)
], SessionsController.prototype, "end", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, audit_decorator_1.Audited)('SESSION_CANCEL', 'Session'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel an active session with no charge' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SessionsController.prototype, "cancel", null);
exports.SessionsController = SessionsController = __decorate([
    (0, swagger_1.ApiTags)('sessions'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('sessions'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.CASHIER),
    __metadata("design:paramtypes", [sessions_service_1.SessionsService])
], SessionsController);
//# sourceMappingURL=sessions.controller.js.map