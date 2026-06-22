import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import {
  Notification,
  NotificationLevel,
} from './entities/notification.entity';
import {
  PaginatedResult,
  PaginationQueryDto,
  paginate,
} from '../../common/dto/pagination.dto';
import { DomainEvent, DomainEventEnvelope } from '../realtime/realtime.events';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notifications: Repository<Notification>,
  ) {}

  /**
   * A new debt entry is operationally important — surface it. Event
   * listeners must not throw (the rejection would be unhandled), so any
   * persistence failure is logged and contained.
   */
  @OnEvent(DomainEvent.DebtCreated)
  async onDebtCreated(
    envelope: DomainEventEnvelope<{
      customerId: string;
      signedAmount: number;
      balance: number;
    }>,
  ): Promise<void> {
    try {
      const { customerId, signedAmount, balance } = envelope.payload;
      await this.create({
        type: 'DEBT_CREATED',
        level: NotificationLevel.WARNING,
        title: 'New debt recorded',
        message: `Customer ${customerId} incurred ${signedAmount}. Balance is now ${balance}.`,
        entityType: 'Customer',
        entityId: customerId,
      });
    } catch (err) {
      this.logger.error(
        'Failed to create debt notification',
        err instanceof Error ? err.stack : String(err),
      );
    }
  }

  async create(input: {
    type: string;
    level: NotificationLevel;
    title: string;
    message: string;
    entityType?: string | null;
    entityId?: string | null;
  }): Promise<Notification> {
    return this.notifications.save(this.notifications.create(input));
  }

  async findAll(
    query: PaginationQueryDto,
    unreadOnly = false,
  ): Promise<PaginatedResult<Notification>> {
    const [items, total] = await this.notifications.findAndCount({
      where: unreadOnly ? { isRead: false } : {},
      order: { createdAt: 'DESC' },
      skip: query.skip,
      take: query.limit,
    });
    return paginate(items, total, query);
  }

  async markRead(id: string): Promise<void> {
    await this.notifications.update({ id }, { isRead: true });
  }

  async markAllRead(): Promise<void> {
    await this.notifications.update({ isRead: false }, { isRead: true });
  }
}
