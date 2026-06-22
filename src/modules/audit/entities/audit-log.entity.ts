import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Append-only audit record. There is intentionally no update/delete path:
 * the entity has no version or soft-delete column and the repository is
 * only ever used with `insert`. Mutating history is a compliance breach,
 * so the table is treated as write-once.
 */
@Entity('audit_logs')
@Index('idx_audit_entity', ['entity', 'entityId'])
@Index('idx_audit_actor', ['actorId'])
@Index('idx_audit_created', ['createdAt'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'actor_id', type: 'uuid', nullable: true })
  actorId: string | null;

  @Column({ name: 'actor_email', type: 'varchar', nullable: true })
  actorEmail: string | null;

  @Column({ type: 'varchar', length: 64 })
  action: string;

  @Column({ type: 'varchar', length: 64 })
  entity: string;

  @Column({ name: 'entity_id', type: 'varchar', nullable: true })
  entityId: string | null;

  @Column({ name: 'old_value', type: 'jsonb', nullable: true })
  oldValue: unknown;

  @Column({ name: 'new_value', type: 'jsonb', nullable: true })
  newValue: unknown;

  @Column({ name: 'ip_address', type: 'varchar', nullable: true })
  ipAddress: string | null;

  @Column({ name: 'user_agent', type: 'varchar', nullable: true })
  userAgent: string | null;

  @Column({ name: 'request_id', type: 'varchar', nullable: true })
  requestId: string | null;

  @Index('idx_audit_created_at')
  @Column({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'now()',
  })
  createdAt: Date;
}
