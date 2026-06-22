import { BaseEntity } from '../../../common/entities/base.entity';
import { Computer } from '../../computers/entities/computer.entity';
export declare class Room extends BaseEntity {
    name: string;
    description: string | null;
    pricePerHour: number;
    isActive: boolean;
    computers: Computer[];
}
