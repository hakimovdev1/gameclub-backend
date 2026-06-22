import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

/**
 * One persisted refresh token (a node in a rotation "family").
 *
 * The raw token is never stored — only an Argon2 hash of it. On every
 * refresh the presented token is rotated: the old row is marked
 * `revoked`/`replacedBy` and a new one is issued. Presenting a token that
 * is already revoked indicates theft, so the whole family is invalidated.
 */
@Entity('refresh_tokens')
@Index('idx_refresh_family', ['familyId'])
@Index('idx_refresh_user', ['userId'])
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  /** Groups all tokens descended from a single login. */
  @Column({ name: 'family_id', type: 'uuid' })
  familyId: string;

  @Column({ name: 'token_hash', type: 'varchar' })
  tokenHash: string;

  @Column({ name: 'revoked', type: 'boolean', default: false })
  revoked: boolean;

  @Column({ name: 'replaced_by', type: 'uuid', nullable: true })
  replacedBy: string | null;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @Column({ name: 'user_agent', type: 'varchar', nullable: true })
  userAgent: string | null;

  @Column({ name: 'ip_address', type: 'varchar', nullable: true })
  ipAddress: string | null;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;
}
