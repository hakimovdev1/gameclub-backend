import { BaseEntity } from '../../../common/entities/base.entity';
export declare enum NotificationLevel {
    INFO = "INFO",
    WARNING = "WARNING",
    CRITICAL = "CRITICAL"
}
export declare class Notification extends BaseEntity {
    type: string;
    level: NotificationLevel;
    title: string;
    message: string;
    entityType: string | null;
    entityId: string | null;
    isRead: boolean;
}
