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
exports.Computer = exports.ComputerStatus = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../../common/entities/base.entity");
const room_entity_1 = require("../../rooms/entities/room.entity");
var ComputerStatus;
(function (ComputerStatus) {
    ComputerStatus["AVAILABLE"] = "AVAILABLE";
    ComputerStatus["IN_USE"] = "IN_USE";
    ComputerStatus["MAINTENANCE"] = "MAINTENANCE";
    ComputerStatus["OFFLINE"] = "OFFLINE";
})(ComputerStatus || (exports.ComputerStatus = ComputerStatus = {}));
let Computer = class Computer extends base_entity_1.BaseEntity {
    label;
    roomId;
    room;
    status;
    specs;
    isActive;
};
exports.Computer = Computer;
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 40 }),
    __metadata("design:type", String)
], Computer.prototype, "label", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'room_id', type: 'uuid' }),
    __metadata("design:type", String)
], Computer.prototype, "roomId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => room_entity_1.Room, (room) => room.computers, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'room_id' }),
    __metadata("design:type", room_entity_1.Room)
], Computer.prototype, "room", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ComputerStatus,
        default: ComputerStatus.AVAILABLE,
    }),
    __metadata("design:type", String)
], Computer.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'specs', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Computer.prototype, "specs", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Computer.prototype, "isActive", void 0);
exports.Computer = Computer = __decorate([
    (0, typeorm_1.Entity)('computers'),
    (0, typeorm_1.Index)('uq_computer_room_label', ['roomId', 'label'], { unique: true })
], Computer);
//# sourceMappingURL=computer.entity.js.map