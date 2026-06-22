import { NotificationsService } from './notifications.service';
import { ListNotificationsQueryDto } from './dto/list-notifications.dto';
export declare class NotificationsController {
    private readonly notifications;
    constructor(notifications: NotificationsService);
    findAll(query: ListNotificationsQueryDto): Promise<import("../../common/dto/pagination.dto").PaginatedResult<import("./entities/notification.entity").Notification>>;
    markRead(id: string): Promise<{
        read: boolean;
    }>;
    markAllRead(): Promise<{
        read: boolean;
    }>;
}
