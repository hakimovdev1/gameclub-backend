import { EventEmitter2 } from '@nestjs/event-emitter';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { DebtTransaction } from './entities/debt-transaction.entity';
import { Money } from '../../common/money/money';
import { PaginatedResult, PaginationQueryDto } from '../../common/dto/pagination.dto';
interface LedgerEntryInput {
    customerId: string;
    amount: number;
    sessionId?: string | null;
    actorId?: string | null;
    reason?: string | null;
}
export declare class DebtService {
    private readonly ledger;
    private readonly dataSource;
    private readonly events;
    constructor(ledger: Repository<DebtTransaction>, dataSource: DataSource, events: EventEmitter2);
    addDebt(input: LedgerEntryInput, manager?: EntityManager): Promise<DebtTransaction>;
    recordPayment(input: LedgerEntryInput): Promise<DebtTransaction>;
    announceDebtChange(customerId: string, entry: DebtTransaction): Promise<void>;
    correct(customerId: string, signedAmount: number, actorId: string, reason: string): Promise<DebtTransaction>;
    getBalance(customerId: string, manager?: EntityManager): Promise<Money>;
    getLedger(customerId: string, query: PaginationQueryDto): Promise<PaginatedResult<DebtTransaction>>;
    getTotalOutstanding(): Promise<Money>;
    private insert;
    private emitAfterChange;
}
export {};
