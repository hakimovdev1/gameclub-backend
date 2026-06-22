import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

/**
 * A club patron. Customers do not authenticate; they exist to attach
 * sessions and debt to a person. The current debt balance is intentionally
 * NOT stored here — it is derived from the immutable debt ledger so it can
 * never drift from the financial truth (see DebtService.getBalance).
 */
@Entity('customers')
export class Customer extends BaseEntity {
  @Column({ name: 'full_name', type: 'varchar', length: 120 })
  fullName: string;

  @Index('uq_customers_phone', { unique: true, where: '"phone" IS NOT NULL' })
  @Column({ type: 'varchar', length: 32, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  note: string | null;

  @Column({ name: 'is_blocked', type: 'boolean', default: false })
  isBlocked: boolean;
}
