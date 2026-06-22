import { DebtService } from './debt.service';
import { CorrectionDto, RecordPaymentDto } from './dto/debt.dto';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
export declare class DebtController {
    private readonly debt;
    constructor(debt: DebtService);
    balance(customerId: string): Promise<{
        customerId: string;
        balance: number;
    }>;
    ledger(customerId: string, query: PaginationQueryDto): Promise<import("../../common/dto/pagination.dto").PaginatedResult<import("./entities/debt-transaction.entity").DebtTransaction>>;
    recordPayment(customerId: string, dto: RecordPaymentDto, user: AuthenticatedUser): Promise<import("./entities/debt-transaction.entity").DebtTransaction>;
    correct(customerId: string, dto: CorrectionDto, user: AuthenticatedUser): Promise<import("./entities/debt-transaction.entity").DebtTransaction>;
}
