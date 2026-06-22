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
exports.DebtController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const debt_service_1 = require("./debt.service");
const debt_dto_1 = require("./dto/debt.dto");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const role_enum_1 = require("../../common/enums/role.enum");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const audit_decorator_1 = require("../audit/audit.decorator");
let DebtController = class DebtController {
    debt;
    constructor(debt) {
        this.debt = debt;
    }
    async balance(customerId) {
        const balance = await this.debt.getBalance(customerId);
        return { customerId, balance: balance.value };
    }
    ledger(customerId, query) {
        return this.debt.getLedger(customerId, query);
    }
    recordPayment(customerId, dto, user) {
        return this.debt.recordPayment({
            customerId,
            amount: dto.amount,
            actorId: user.sub,
            reason: dto.reason,
        });
    }
    correct(customerId, dto, user) {
        return this.debt.correct(customerId, dto.signedAmount, user.sub, dto.reason);
    }
};
exports.DebtController = DebtController;
__decorate([
    (0, common_1.Get)('balance'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.CASHIER),
    (0, swagger_1.ApiOperation)({ summary: 'Get the live debt balance for a customer' }),
    __param(0, (0, common_1.Param)('customerId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DebtController.prototype, "balance", null);
__decorate([
    (0, common_1.Get)('ledger'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.CASHIER),
    (0, swagger_1.ApiOperation)({ summary: 'List the customer financial ledger' }),
    __param(0, (0, common_1.Param)('customerId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", void 0)
], DebtController.prototype, "ledger", null);
__decorate([
    (0, common_1.Post)('payments'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.CASHIER),
    (0, audit_decorator_1.Audited)('DEBT_PAYMENT', 'DebtTransaction'),
    (0, swagger_1.ApiOperation)({ summary: 'Record a debt payment' }),
    __param(0, (0, common_1.Param)('customerId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, debt_dto_1.RecordPaymentDto, Object]),
    __metadata("design:returntype", void 0)
], DebtController.prototype, "recordPayment", null);
__decorate([
    (0, common_1.Post)('corrections'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.OWNER),
    (0, audit_decorator_1.Audited)('DEBT_CORRECTION', 'DebtTransaction'),
    (0, swagger_1.ApiOperation)({ summary: 'Apply a signed correction (owner only)' }),
    __param(0, (0, common_1.Param)('customerId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, debt_dto_1.CorrectionDto, Object]),
    __metadata("design:returntype", void 0)
], DebtController.prototype, "correct", null);
exports.DebtController = DebtController = __decorate([
    (0, swagger_1.ApiTags)('debt'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('customers/:customerId/debt'),
    __metadata("design:paramtypes", [debt_service_1.DebtService])
], DebtController);
//# sourceMappingURL=debt.controller.js.map