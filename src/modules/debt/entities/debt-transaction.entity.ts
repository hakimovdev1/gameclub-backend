import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { moneyColumnTransformer } from '../../../common/money/money.transformer';
import { Customer } from '../../customers/entities/customer.entity';

export enum DebtTransactionType {
  /** Customer incurred debt (e.g. a session was not fully paid). */
  DEBT_ADD = 'DEBT_ADD',
  /** Customer paid down outstanding debt. */
  DEBT_PAYMENT = 'DEBT_PAYMENT',
  /** Manual adjustment (signed) by an owner to correct the ledger. */
  DEBT_CORRECTION = 'DEBT_CORRECTION',
}

/**
 * An append-only entry in the customer's financial ledger. The running
 * balance is never stored; it is the signed sum of these rows. `amount`
 * is always a non-negative integer in minor units; the *direction* is
 * encoded by `type` (ADD increases, PAYMENT decreases). A CORRECTION uses
 * `signedAmount` so an owner can adjust either way with a reason.
 */
@Entity('debt_transactions')
@Index('idx_debt_customer', ['customerId'])
@Index('idx_debt_customer_created', ['customerId', 'createdAt'])
export class DebtTransaction extends BaseEntity {
  @Column({ name: 'customer_id', type: 'uuid' })
  customerId: string;

  @ManyToOne(() => Customer, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ type: 'enum', enum: DebtTransactionType })
  type: DebtTransactionType;

  /**
   * Signed amount in minor units expressing the effect on the balance:
   *  - DEBT_ADD:      positive
   *  - DEBT_PAYMENT:  negative
   *  - DEBT_CORRECTION: either sign
   * Storing the signed effect makes the balance a pure SUM() with no CASE.
   */
  @Column({
    name: 'signed_amount',
    type: 'bigint',
    transformer: moneyColumnTransformer,
  })
  signedAmount: number;

  @Column({ name: 'session_id', type: 'uuid', nullable: true })
  sessionId: string | null;

  @Column({ name: 'actor_id', type: 'uuid', nullable: true })
  actorId: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reason: string | null;
}
