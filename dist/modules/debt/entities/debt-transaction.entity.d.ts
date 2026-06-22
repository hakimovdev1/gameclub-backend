import { BaseEntity } from '../../../common/entities/base.entity';
import { Customer } from '../../customers/entities/customer.entity';
export declare enum DebtTransactionType {
    DEBT_ADD = "DEBT_ADD",
    DEBT_PAYMENT = "DEBT_PAYMENT",
    DEBT_CORRECTION = "DEBT_CORRECTION"
}
export declare class DebtTransaction extends BaseEntity {
    customerId: string;
    customer: Customer;
    type: DebtTransactionType;
    signedAmount: number;
    sessionId: string | null;
    actorId: string | null;
    reason: string | null;
}
