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
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const typeorm_2 = require("typeorm");
const notification_entity_1 = require("./entities/notification.entity");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const realtime_events_1 = require("../realtime/realtime.events");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    notifications;
    logger = new common_1.Logger(NotificationsService_1.name);
    constructor(notifications) {
        this.notifications = notifications;
    }
    async onDebtCreated(envelope) {
        try {
            const { customerId, signedAmount, balance } = envelope.payload;
            await this.create({
                type: 'DEBT_CREATED',
                level: notification_entity_1.NotificationLevel.WARNING,
                title: 'New debt recorded',
                message: `Customer ${customerId} incurred ${signedAmount}. Balance is now ${balance}.`,
                entityType: 'Customer',
                entityId: customerId,
            });
        }
        catch (err) {
            this.logger.error('Failed to create debt notification', err instanceof Error ? err.stack : String(err));
        }
    }
    async create(input) {
        return this.notifications.save(this.notifications.create(input));
    }
    async findAll(query, unreadOnly = false) {
        const [items, total] = await this.notifications.findAndCount({
            where: unreadOnly ? { isRead: false } : {},
            order: { createdAt: 'DESC' },
            skip: query.skip,
            take: query.limit,
        });
        return (0, pagination_dto_1.paginate)(items, total, query);
    }
    async markRead(id) {
        await this.notifications.update({ id }, { isRead: true });
    }
    async markAllRead() {
        await this.notifications.update({ isRead: false }, { isRead: true });
    }
};
exports.NotificationsService = NotificationsService;
__decorate([
    (0, event_emitter_1.OnEvent)(realtime_events_1.DomainEvent.DebtCreated),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsService.prototype, "onDebtCreated", null);
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map