import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { moneyColumnTransformer } from '../../../common/money/money.transformer';
import { Computer } from '../../computers/entities/computer.entity';
import { Customer } from '../../customers/entities/customer.entity';

export enum SessionType {
  /** Prepaid for a fixed number of minutes. */
  FIXED_DURATION = 'FIXED_DURATION',
  /** Runs until a specific wall-clock time. */
  FIXED_END_TIME = 'FIXED_END_TIME',
  /** Pay-as-you-go; charge accrues until the cashier ends it. */
  OPEN_SESSION = 'OPEN_SESSION',
}

export enum SessionStatus {
  ACTIVE = 'ACTIVE',
  ENDED = 'ENDED',
  CANCELLED = 'CANCELLED',
}

/**
 * A play session on one computer. Group sessions are modelled as several
 * Session rows sharing a `groupId`, created in a single transaction.
 *
 * Money invariants:
 *  - `ratePerHour` is SNAPSHOTTED from the room at start, so later price
 *    changes never rewrite history.
 *  - `amountDue` is the deterministic, integer charge (minor units).
 *  - `amountPaid` is what the cashier collected; any shortfall (with a
 *    customer attached) is pushed to the debt ledger atomically.
 */
@Entity('sessions')
@Index('idx_session_status', ['status'])
@Index('idx_session_group', ['groupId'])
@Index('idx_session_customer', ['customerId'])
@Index('idx_session_room', ['roomId'])
// Supports analytics: WHERE status = 'ENDED' AND ended_at BETWEEN ...
@Index('idx_session_status_ended', ['status', 'endedAt'])
// At most one ACTIVE session per computer — enforced by a partial unique index
// (created in the migration) on (computer_id) WHERE status = 'ACTIVE'.
@Index('uq_session_active_computer', ['computerId'], {
  unique: true,
  where: `"status" = 'ACTIVE'`,
})
export class Session extends BaseEntity {
  @Column({ name: 'group_id', type: 'uuid', nullable: true })
  groupId: string | null;

  @Column({ name: 'computer_id', type: 'uuid' })
  computerId: string;

  @ManyToOne(() => Computer, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'computer_id' })
  computer: Computer;

  @Column({ name: 'room_id', type: 'uuid' })
  roomId: string;

  @Column({ name: 'customer_id', type: 'uuid', nullable: true })
  customerId: string | null;

  @ManyToOne(() => Customer, { onDelete: 'RESTRICT', nullable: true })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer | null;

  @Column({ type: 'enum', enum: SessionType })
  type: SessionType;

  @Column({ type: 'enum', enum: SessionStatus, default: SessionStatus.ACTIVE })
  status: SessionStatus;

  @Column({
    name: 'rate_per_hour',
    type: 'bigint',
    transformer: moneyColumnTransformer,
  })
  ratePerHour: number;

  @Column({ name: 'started_at', type: 'timestamptz' })
  startedAt: Date;

  /** Scheduled end for fixed session types; null for OPEN_SESSION. */
  @Column({ name: 'planned_end_at', type: 'timestamptz', nullable: true })
  plannedEndAt: Date | null;

  @Column({ name: 'ended_at', type: 'timestamptz', nullable: true })
  endedAt: Date | null;

  /** Authoritative charge in minor units. Locked once the session ends. */
  @Column({
    name: 'amount_due',
    type: 'bigint',
    default: '0',
    transformer: moneyColumnTransformer,
  })
  amountDue: number;

  @Column({
    name: 'amount_paid',
    type: 'bigint',
    default: '0',
    transformer: moneyColumnTransformer,
  })
  amountPaid: number;

  @Column({ name: 'started_by', type: 'uuid', nullable: true })
  startedBy: string | null;

  @Column({ name: 'ended_by', type: 'uuid', nullable: true })
  endedBy: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  notes: string | null;
}
