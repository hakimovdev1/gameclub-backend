import { BaseEntity } from '../../../common/entities/base.entity';
import { Computer } from '../../computers/entities/computer.entity';
import { Customer } from '../../customers/entities/customer.entity';
export declare enum SessionType {
    FIXED_DURATION = "FIXED_DURATION",
    FIXED_END_TIME = "FIXED_END_TIME",
    OPEN_SESSION = "OPEN_SESSION"
}
export declare enum SessionStatus {
    ACTIVE = "ACTIVE",
    ENDED = "ENDED",
    CANCELLED = "CANCELLED"
}
export declare class Session extends BaseEntity {
    groupId: string | null;
    computerId: string;
    computer: Computer;
    roomId: string;
    customerId: string | null;
    customer: Customer | null;
    type: SessionType;
    status: SessionStatus;
    ratePerHour: number;
    startedAt: Date;
    plannedEndAt: Date | null;
    endedAt: Date | null;
    amountDue: number;
    amountPaid: number;
    startedBy: string | null;
    endedBy: string | null;
    notes: string | null;
}
