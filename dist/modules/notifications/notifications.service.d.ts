import { Repository } from 'typeorm';
import { Notification, NotificationLevel } from './entities/notification.entity';
import { PaginatedResult, PaginationQueryDto } from '../../common/dto/pagination.dto';
import { DomainEventEnvelope } from '../realtime/realtime.events';
export declare class NotificationsService {
    private readonly notifications;
    private readonly logger;
    constructor(notifications: Repository<Notification>);
    onDebtCreated(envelope: DomainEventEnvelope<{
        customerId: string;
        signedAmount: number;
        balance: number;
    }>): Promise<void>;
    create(input: {
        type: string;
        level: NotificationLevel;
        title: string;
        message: string;
        entityType?: string | null;
        entityId?: string | null;
    }): Promise<Notification>;
    findAll(query: PaginationQueryDto, unreadOnly?: boolean): Promise<PaginatedResult<Notification>>;
    markRead(id: string): Promise<void>;
    markAllRead(): Promise<void>;
}
