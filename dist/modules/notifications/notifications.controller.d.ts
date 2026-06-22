import { NotificationsService } from './notifications.service';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
export declare class NotificationsController {
    private readonly notifications;
    constructor(notifications: NotificationsService);
    findAll(query: PaginationQueryDto, unreadOnly?: string): Promise<import("../../common/dto/pagination.dto").PaginatedResult<import("./entities/notification.entity").Notification>>;
    markRead(id: string): Promise<{
        read: boolean;
    }>;
    markAllRead(): Promise<{
        read: boolean;
    }>;
}
