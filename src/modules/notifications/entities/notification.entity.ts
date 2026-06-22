import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum NotificationLevel {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
}

/**
 * A persisted operational notification (e.g. "debt created", "session
 * ended unpaid"). Generated from domain events so staff have an auditable
 * inbox independent of the ephemeral WebSocket stream.
 */
@Entity('notifications')
@Index('idx_notification_read', ['isRead'])
export class Notification extends BaseEntity {
  @Column({ type: 'varchar', length: 64 })
  type: string;

  @Column({
    type: 'enum',
    enum: NotificationLevel,
    default: NotificationLevel.INFO,
  })
  level: NotificationLevel;

  @Column({ type: 'varchar', length: 160 })
  title: string;

  @Column({ type: 'varchar', length: 512 })
  message: string;

  @Column({ name: 'entity_type', type: 'varchar', length: 64, nullable: true })
  entityType: string | null;

  @Column({ name: 'entity_id', type: 'varchar', nullable: true })
  entityId: string | null;

  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead: boolean;
}
