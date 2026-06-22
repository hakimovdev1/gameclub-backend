import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Customer } from '../customers/entities/customer.entity';
import {
  DebtTransaction,
  DebtTransactionType,
} from './entities/debt-transaction.entity';
import { Money } from '../../common/money/money';
import { BusinessRuleException } from '../../common/exceptions/domain.exception';
import {
  PaginatedResult,
  PaginationQueryDto,
  paginate,
} from '../../common/dto/pagination.dto';
import { DomainEvent, buildEvent } from '../realtime/realtime.events';

interface LedgerEntryInput {
  customerId: string;
  amount: number; // non-negative magnitude in minor units
  sessionId?: string | null;
  actorId?: string | null;
  reason?: string | null;
}

@Injectable()
export class DebtService {
  constructor(
    @InjectRepository(DebtTransaction)
    private readonly ledger: Repository<DebtTransaction>,
    private readonly dataSource: DataSource,
    private readonly events: EventEmitter2,
  ) {}

  /**
   * Append a DEBT_ADD entry. Optionally runs inside a caller-provided
   * transaction so that "end session + record debt" is atomic.
   */
  async addDebt(
    input: LedgerEntryInput,
    manager?: EntityManager,
  ): Promise<DebtTransaction> {
    const magnitude = Money.fromMinor(input.amount);
    if (!magnitude.isPositive()) {
      throw new BusinessRuleException(
        'INVALID_DEBT_AMOUNT',
        'Debt amount must be positive',
      );
    }
    const entry = await this.insert(
      {
        customerId: input.customerId,
        type: DebtTransactionType.DEBT_ADD,
        signedAmount: magnitude.value,
        sessionId: input.sessionId ?? null,
        actorId: input.actorId ?? null,
        reason: input.reason ?? null,
      },
      manager,
    );
    // When running inside a caller's transaction the row is not yet
    // committed, so the balance an event would report could be read on
    // another connection and be stale. The caller announces after commit
    // via announceDebtChange(); only self-contained calls emit here.
    if (!manager) {
      await this.emitAfterChange(
        input.customerId,
        DomainEvent.DebtCreated,
        entry,
      );
    }
    return entry;
  }

  /**
   * Append a DEBT_PAYMENT entry. The balance check and the insert run in a
   * single transaction with a pessimistic lock on the customer row, so
   * concurrent payments cannot both pass the overpayment guard (no TOCTOU).
   */
  async recordPayment(input: LedgerEntryInput): Promise<DebtTransaction> {
    const magnitude = Money.fromMinor(input.amount);
    if (!magnitude.isPositive()) {
      throw new BusinessRuleException(
        'INVALID_PAYMENT_AMOUNT',
        'Payment amount must be positive',
      );
    }

    const entry = await this.dataSource.transaction(async (manager) => {
      // Serialise concurrent ledger mutations for this customer.
      const customer = await manager.findOne(Customer, {
        where: { id: input.customerId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!customer) {
        throw new BusinessRuleException(
          'CUSTOMER_NOT_FOUND',
          'Customer does not exist',
        );
      }
      const balance = await this.getBalance(input.customerId, manager);
      if (magnitude.greaterThan(balance)) {
        throw new BusinessRuleException(
          'OVERPAYMENT',
          'Payment exceeds the outstanding balance',
          { balance: balance.value, attempted: magnitude.value },
        );
      }
      return this.insert(
        {
          customerId: input.customerId,
          type: DebtTransactionType.DEBT_PAYMENT,
          signedAmount: -magnitude.value,
          sessionId: input.sessionId ?? null,
          actorId: input.actorId ?? null,
          reason: input.reason ?? null,
        },
        manager,
      );
    });

    await this.emitAfterChange(
      input.customerId,
      DomainEvent.DebtUpdated,
      entry,
    );
    return entry;
  }

  /**
   * Announce a debt change committed by another aggregate (e.g. the
   * session-end transaction). Called after that transaction commits so the
   * reported balance is authoritative.
   */
  async announceDebtChange(
    customerId: string,
    entry: DebtTransaction,
  ): Promise<void> {
    await this.emitAfterChange(customerId, DomainEvent.DebtCreated, entry);
  }

  /** Append a signed DEBT_CORRECTION (owner-only adjustment). */
  async correct(
    customerId: string,
    signedAmount: number,
    actorId: string,
    reason: string,
  ): Promise<DebtTransaction> {
    const value = Money.fromMinor(signedAmount);
    if (value.isZero()) {
      throw new BusinessRuleException(
        'INVALID_CORRECTION',
        'Correction amount cannot be zero',
      );
    }
    const entry = await this.insert({
      customerId,
      type: DebtTransactionType.DEBT_CORRECTION,
      signedAmount: value.value,
      actorId,
      reason,
    });
    await this.emitAfterChange(customerId, DomainEvent.DebtUpdated, entry);
    return entry;
  }

  /** Current balance = signed sum of every ledger entry. Never stored. */
  async getBalance(
    customerId: string,
    manager?: EntityManager,
  ): Promise<Money> {
    const repo = manager ? manager.getRepository(DebtTransaction) : this.ledger;
    const row = await repo
      .createQueryBuilder('t')
      .select('COALESCE(SUM(t.signed_amount), 0)', 'sum')
      .where('t.customer_id = :customerId', { customerId })
      .getRawOne<{ sum: string }>();
    return Money.fromString(row?.sum ?? '0');
  }

  async getLedger(
    customerId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<DebtTransaction>> {
    const [items, total] = await this.ledger.findAndCount({
      where: { customerId },
      order: { createdAt: 'DESC' },
      skip: query.skip,
      take: query.limit,
    });
    return paginate(items, total, query);
  }

  /** Aggregate outstanding debt across all customers (for analytics). */
  async getTotalOutstanding(): Promise<Money> {
    const row = await this.ledger
      .createQueryBuilder('t')
      .select('COALESCE(SUM(t.signed_amount), 0)', 'sum')
      .getRawOne<{ sum: string }>();
    return Money.fromString(row?.sum ?? '0');
  }

  private async insert(
    data: Partial<DebtTransaction>,
    manager?: EntityManager,
  ): Promise<DebtTransaction> {
    const repo = manager ? manager.getRepository(DebtTransaction) : this.ledger;
    return repo.save(repo.create(data));
  }

  private async emitAfterChange(
    customerId: string,
    event: (typeof DomainEvent)[keyof typeof DomainEvent],
    entry: DebtTransaction,
  ): Promise<void> {
    // Recompute the (committed) balance so listeners get the authoritative
    // value, then emit.
    const balance = await this.getBalance(customerId);
    this.events.emit(
      event,
      buildEvent(event, {
        customerId,
        transactionId: entry.id,
        type: entry.type,
        signedAmount: entry.signedAmount,
        balance: balance.value,
      }),
    );
  }
}
