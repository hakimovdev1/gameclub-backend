import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { moneyColumnTransformer } from '../../../common/money/money.transformer';
import { Computer } from '../../computers/entities/computer.entity';

/**
 * A room (a pricing zone such as "Standard", "VIP", "PlayStation"). The
 * hourly rate lives on the room — every computer in the room inherits it,
 * which is the single source of truth for session pricing.
 *
 * `pricePerHour` is stored as integer minor units (so'm) in a Postgres
 * `bigint` column; never as a floating point amount.
 */
@Entity('rooms')
export class Room extends BaseEntity {
  @Index('uq_rooms_name', { unique: true })
  @Column({ type: 'varchar', length: 80 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string | null;

  @Column({
    name: 'price_per_hour',
    type: 'bigint',
    transformer: moneyColumnTransformer,
  })
  pricePerHour: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => Computer, (computer) => computer.room)
  computers: Computer[];
}
