import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

/**
 * Typed key/value configuration editable at runtime by the owner
 * (e.g. club name, currency code, late-return grace period). Values are
 * stored as JSONB so any serialisable shape is supported.
 */
@Entity('settings')
export class Setting {
  @PrimaryColumn({ type: 'varchar', length: 80 })
  key: string;

  @Column({ type: 'jsonb' })
  value: unknown;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string | null;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
