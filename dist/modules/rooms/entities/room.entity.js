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
exports.Room = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../../common/entities/base.entity");
const money_transformer_1 = require("../../../common/money/money.transformer");
const computer_entity_1 = require("../../computers/entities/computer.entity");
let Room = class Room extends base_entity_1.BaseEntity {
    name;
    description;
    pricePerHour;
    isActive;
    computers;
};
exports.Room = Room;
__decorate([
    (0, typeorm_1.Index)('uq_rooms_name', { unique: true }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 80 }),
    __metadata("design:type", String)
], Room.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], Room.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'price_per_hour',
        type: 'bigint',
        transformer: money_transformer_1.moneyColumnTransformer,
    }),
    __metadata("design:type", Number)
], Room.prototype, "pricePerHour", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Room.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => computer_entity_1.Computer, (computer) => computer.room),
    __metadata("design:type", Array)
], Room.prototype, "computers", void 0);
exports.Room = Room = __decorate([
    (0, typeorm_1.Entity)('rooms')
], Room);
//# sourceMappingURL=room.entity.js.map