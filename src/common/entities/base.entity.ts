import {
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

/**
 * Shared persistence contract for every aggregate root and entity:
 *  - UUID primary key (no sequential id enumeration)
 *  - created/updated timestamps (timestamptz)
 *  - soft delete via `deletedAt`
 *  - optimistic locking via a monotonic `version` column
 */
export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  @VersionColumn({ default: 1 })
  version: number;
}
