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
exports.ComputersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const computers_service_1 = require("./computers.service");
const create_computer_dto_1 = require("./dto/create-computer.dto");
const update_computer_dto_1 = require("./dto/update-computer.dto");
const computer_entity_1 = require("./entities/computer.entity");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const role_enum_1 = require("../../common/enums/role.enum");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const audit_decorator_1 = require("../audit/audit.decorator");
let ComputersController = class ComputersController {
    computers;
    constructor(computers) {
        this.computers = computers;
    }
    create(dto) {
        return this.computers.create(dto);
    }
    findAll(query, roomId, status) {
        return this.computers.findAll(query, { roomId, status });
    }
    findOne(id) {
        return this.computers.findById(id);
    }
    update(id, dto) {
        return this.computers.update(id, dto);
    }
    remove(id) {
        return this.computers.remove(id);
    }
};
exports.ComputersController = ComputersController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.MANAGER),
    (0, audit_decorator_1.Audited)('COMPUTER_CREATE', 'Computer'),
    (0, swagger_1.ApiOperation)({ summary: 'Register a computer in a room' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_computer_dto_1.CreateComputerDto]),
    __metadata("design:returntype", void 0)
], ComputersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.CASHIER),
    (0, swagger_1.ApiQuery)({ name: 'roomId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: computer_entity_1.ComputerStatus }),
    (0, swagger_1.ApiOperation)({ summary: 'List computers' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Query)('roomId')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationQueryDto, String, String]),
    __metadata("design:returntype", void 0)
], ComputersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.CASHIER),
    (0, swagger_1.ApiOperation)({ summary: 'Get a computer' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ComputersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.MANAGER),
    (0, audit_decorator_1.Audited)('COMPUTER_UPDATE', 'Computer'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a computer (status, room, specs)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_computer_dto_1.UpdateComputerDto]),
    __metadata("design:returntype", void 0)
], ComputersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.MANAGER),
    (0, audit_decorator_1.Audited)('COMPUTER_DELETE', 'Computer'),
    (0, swagger_1.ApiOperation)({ summary: 'Soft-delete a computer' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ComputersController.prototype, "remove", null);
exports.ComputersController = ComputersController = __decorate([
    (0, swagger_1.ApiTags)('computers'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('computers'),
    __metadata("design:paramtypes", [computers_service_1.ComputersService])
], ComputersController);
//# sourceMappingURL=computers.controller.js.map