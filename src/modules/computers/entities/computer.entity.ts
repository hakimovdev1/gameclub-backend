import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Room } from '../../rooms/entities/room.entity';

export enum ComputerStatus {
  AVAILABLE = 'AVAILABLE',
  IN_USE = 'IN_USE',
  MAINTENANCE = 'MAINTENANCE',
  OFFLINE = 'OFFLINE',
}

/**
 * A physical workstation/console. Belongs to exactly one room (which
 * defines its price). `status` reflects operational state; an active
 * session drives it to IN_USE and releases it back to AVAILABLE on end.
 */
@Entity('computers')
@Index('uq_computer_room_label', ['roomId', 'label'], { unique: true })
export class Computer extends BaseEntity {
  @Column({ type: 'varchar', length: 40 })
  label: string;

  @Column({ name: 'room_id', type: 'uuid' })
  roomId: string;

  @ManyToOne(() => Room, (room) => room.computers, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'room_id' })
  room: Room;

  @Column({
    type: 'enum',
    enum: ComputerStatus,
    default: ComputerStatus.AVAILABLE,
  })
  status: ComputerStatus;

  @Column({ name: 'specs', type: 'jsonb', nullable: true })
  specs: Record<string, unknown> | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}
