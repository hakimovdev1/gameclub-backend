import { BaseEntity } from '../../../common/entities/base.entity';
import { Room } from '../../rooms/entities/room.entity';
export declare enum ComputerStatus {
    AVAILABLE = "AVAILABLE",
    IN_USE = "IN_USE",
    MAINTENANCE = "MAINTENANCE",
    OFFLINE = "OFFLINE"
}
export declare class Computer extends BaseEntity {
    label: string;
    roomId: string;
    room: Room;
    status: ComputerStatus;
    specs: Record<string, unknown> | null;
    isActive: boolean;
}
