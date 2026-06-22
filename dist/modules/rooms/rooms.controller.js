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
exports.RoomsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const rooms_service_1 = require("./rooms.service");
const create_room_dto_1 = require("./dto/create-room.dto");
const update_room_dto_1 = require("./dto/update-room.dto");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const role_enum_1 = require("../../common/enums/role.enum");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const audit_decorator_1 = require("../audit/audit.decorator");
let RoomsController = class RoomsController {
    rooms;
    constructor(rooms) {
        this.rooms = rooms;
    }
    create(dto) {
        return this.rooms.create(dto);
    }
    findAll(query) {
        return this.rooms.findAll(query);
    }
    findOne(id) {
        return this.rooms.findById(id);
    }
    update(id, dto) {
        return this.rooms.update(id, dto);
    }
    remove(id) {
        return this.rooms.remove(id);
    }
};
exports.RoomsController = RoomsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.MANAGER),
    (0, audit_decorator_1.Audited)('ROOM_CREATE', 'Room'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a pricing room' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_room_dto_1.CreateRoomDto]),
    __metadata("design:returntype", void 0)
], RoomsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.CASHIER),
    (0, swagger_1.ApiOperation)({ summary: 'List rooms' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", void 0)
], RoomsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.CASHIER),
    (0, swagger_1.ApiOperation)({ summary: 'Get a room' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RoomsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.MANAGER),
    (0, audit_decorator_1.Audited)('ROOM_UPDATE', 'Room'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a room (incl. pricing)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_room_dto_1.UpdateRoomDto]),
    __metadata("design:returntype", void 0)
], RoomsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.MANAGER),
    (0, audit_decorator_1.Audited)('ROOM_DELETE', 'Room'),
    (0, swagger_1.ApiOperation)({ summary: 'Soft-delete a room' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RoomsController.prototype, "remove", null);
exports.RoomsController = RoomsController = __decorate([
    (0, swagger_1.ApiTags)('rooms'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('rooms'),
    __metadata("design:paramtypes", [rooms_service_1.RoomsService])
], RoomsController);
//# sourceMappingURL=rooms.controller.js.map