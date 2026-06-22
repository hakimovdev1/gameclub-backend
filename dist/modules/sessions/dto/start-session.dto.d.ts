import { SessionType } from '../entities/session.entity';
export declare class StartSessionDto {
    computerIds: string[];
    type: SessionType;
    customerId?: string;
    durationMinutes?: number;
    plannedEndAt?: Date;
    notes?: string;
}
