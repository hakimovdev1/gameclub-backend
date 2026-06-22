import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Role } from '../../../common/enums/role.enum';

/**
 * A staff account (owner / manager / cashier). Customers are a separate
 * concept and never authenticate here. The password is stored only as an
 * Argon2id hash; the hash column is excluded from default selects.
 */
@Entity('users')
export class User extends BaseEntity {
  // Emails are normalised to lowercase at the service boundary, so a plain
  // unique index gives case-insensitive uniqueness without requiring the
  // `citext` extension (which needs superuser to install).
  @Index('uq_users_email', { unique: true })
  @Column({ type: 'varchar', length: 160 })
  email: string;

  @Column({ name: 'full_name', type: 'varchar', length: 120 })
  fullName: string;

  @Column({ name: 'password_hash', type: 'varchar', select: false })
  passwordHash: string;

  @Column({ type: 'enum', enum: Role, default: Role.CASHIER })
  role: Role;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  lastLoginAt: Date | null;

  @Column({ name: 'failed_login_attempts', type: 'int', default: 0 })
  failedLoginAttempts: number;

  @Column({ name: 'locked_until', type: 'timestamptz', nullable: true })
  lockedUntil: Date | null;
}
