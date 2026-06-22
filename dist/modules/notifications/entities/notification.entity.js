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
exports.Notification = exports.NotificationLevel = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../../common/entities/base.entity");
var NotificationLevel;
(function (NotificationLevel) {
    NotificationLevel["INFO"] = "INFO";
    NotificationLevel["WARNING"] = "WARNING";
    NotificationLevel["CRITICAL"] = "CRITICAL";
})(NotificationLevel || (exports.NotificationLevel = NotificationLevel = {}));
let Notification = class Notification extends base_entity_1.BaseEntity {
    type;
    level;
    title;
    message;
    entityType;
    entityId;
    isRead;
};
exports.Notification = Notification;
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 64 }),
    __metadata("design:type", String)
], Notification.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: NotificationLevel,
        default: NotificationLevel.INFO,
    }),
    __metadata("design:type", String)
], Notification.prototype, "level", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 160 }),
    __metadata("design:type", String)
], Notification.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 512 }),
    __metadata("design:type", String)
], Notification.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'entity_type', type: 'varchar', length: 64, nullable: true }),
    __metadata("design:type", Object)
], Notification.prototype, "entityType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'entity_id', type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Notification.prototype, "entityId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_read', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Notification.prototype, "isRead", void 0);
exports.Notification = Notification = __decorate([
    (0, typeorm_1.Entity)('notifications'),
    (0, typeorm_1.Index)('idx_notification_read', ['isRead'])
], Notification);
//# sourceMappingURL=notification.entity.js.map