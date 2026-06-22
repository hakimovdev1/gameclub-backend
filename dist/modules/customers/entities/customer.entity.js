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
exports.Customer = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../../common/entities/base.entity");
let Customer = class Customer extends base_entity_1.BaseEntity {
    fullName;
    phone;
    note;
    isBlocked;
};
exports.Customer = Customer;
__decorate([
    (0, typeorm_1.Column)({ name: 'full_name', type: 'varchar', length: 120 }),
    __metadata("design:type", String)
], Customer.prototype, "fullName", void 0);
__decorate([
    (0, typeorm_1.Index)('uq_customers_phone', { unique: true, where: '"phone" IS NOT NULL' }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 32, nullable: true }),
    __metadata("design:type", Object)
], Customer.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], Customer.prototype, "note", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_blocked', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Customer.prototype, "isBlocked", void 0);
exports.Customer = Customer = __decorate([
    (0, typeorm_1.Entity)('customers')
], Customer);
//# sourceMappingURL=customer.entity.js.map