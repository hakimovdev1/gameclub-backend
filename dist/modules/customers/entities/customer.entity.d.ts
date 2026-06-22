import { BaseEntity } from '../../../common/entities/base.entity';
export declare class Customer extends BaseEntity {
    fullName: string;
    phone: string | null;
    note: string | null;
    isBlocked: boolean;
}
