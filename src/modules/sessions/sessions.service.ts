import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { Session, SessionStatus } from './entities/session.entity';
import {
  Computer,
  ComputerStatus,
} from '../computers/entities/computer.entity';
import { Room } from '../rooms/entities/room.entity';
import { Customer } from '../customers/entities/customer.entity';
import { SessionPricingService } from './session-pricing.service';
import { DebtService } from '../debt/debt.service';
import { StartSessionDto } from './dto/start-session.dto';
import { ExtendSessionDto } from './dto/extend-session.dto';
import { EndSessionDto } from './dto/end-session.dto';
import { Money } from '../../common/money/money';
import {
  BusinessRuleException,
  ConflictException,
  ResourceNotFoundException,
} from '../../common/exceptions/domain.exception';
import {
  PaginatedResult,
  PaginationQueryDto,
  paginate,
} from '../../common/dto/pagination.dto';
import { DomainEvent, buildEvent } from '../realtime/realtime.events';

interface ActorContext {
  actorId: string;
}

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private readonly sessions: Repository<Session>,
    private readonly dataSource: DataSource,
    private readonly pricing: SessionPricingService,
    private readonly debt: DebtService,
    private readonly events: EventEmitter2,
  ) {}

  /**
   * Starts one session, or an atomic group of sessions across several
   * computers. Every computer is locked and validated inside a single
   * transaction; if any computer is unavailable the whole batch rolls
   * back, so a group either fully starts or not at all.
   */
  async start(dto: StartSessionDto, ctx: ActorContext): Promise<Session[]> {
    const startedAt = new Date();
    const isGroup = dto.computerIds.length > 1;
    const groupId = isGroup ? randomUUID() : null;

    const created = await this.dataSource.transaction(async (manager) => {
      const customer = await this.resolveCustomer(manager, dto.customerId);
      const results: Session[] = [];

      for (const computerId of dto.computerIds) {
        const computer = await manager.findOne(Computer, {
          where: { id: computerId },
          lock: { mode: 'pessimistic_write' },
        });
        if (!computer) {
          throw new ResourceNotFoundException('Computer', computerId);
        }
        if (
          !computer.isActive ||
          computer.status !== ComputerStatus.AVAILABLE
        ) {
          throw new ConflictException(
            'COMPUTER_NOT_AVAILABLE',
            `Computer ${computer.label} is not available`,
            { computerId, status: computer.status },
          );
        }

        const room = await manager.findOne(Room, {
          where: { id: computer.roomId },
        });
        if (!room || !room.isActive) {
          throw new BusinessRuleException(
            'ROOM_INACTIVE',
            'The room for this computer is inactive',
          );
        }

        const plan = this.pricing.plan(dto.type, room.pricePerHour, startedAt, {
          durationMinutes: dto.durationMinutes,
          plannedEndAt: dto.plannedEndAt,
        });

        const session = manager.create(Session, {
          groupId,
          computerId: computer.id,
          roomId: room.id,
          customerId: customer?.id ?? null,
          type: dto.type,
          status: SessionStatus.ACTIVE,
          ratePerHour: room.pricePerHour,
          startedAt,
          plannedEndAt: plan.plannedEndAt,
          amountDue: plan.plannedAmount.value,
          amountPaid: 0,
          startedBy: ctx.actorId,
          notes: dto.notes ?? null,
        });
        const saved = await manager.save(session);

        computer.status = ComputerStatus.IN_USE;
        await manager.save(computer);

        results.push(saved);
      }

      return results;
    });

    for (const session of created) {
      this.events.emit(
        DomainEvent.SessionStarted,
        buildEvent(DomainEvent.SessionStarted, this.toEvent(session)),
      );
    }
    return created;
  }

  /**
   * Extends a fixed session and recomputes its locked charge. The acting
   * user is captured by the audit interceptor (SESSION_EXTEND), so no
   * actor context is needed here.
   */
  async extend(id: string, dto: ExtendSessionDto): Promise<Session> {
    const updated = await this.dataSource.transaction(async (manager) => {
      const session = await this.lockActive(manager, id);
      const plan = this.pricing.extend(session, {
        addMinutes: dto.addMinutes,
        newEndAt: dto.newEndAt,
      });
      session.plannedEndAt = plan.plannedEndAt;
      session.amountDue = plan.plannedAmount.value;
      return manager.save(session);
    });

    this.events.emit(
      DomainEvent.SessionExtended,
      buildEvent(DomainEvent.SessionExtended, this.toEvent(updated)),
    );
    return updated;
  }

  /**
   * Ends a session: finalises the charge, records payment, frees the
   * computer, and pushes any shortfall to the customer's debt ledger —
   * all atomically. The actual amount due and the debt entry can never
   * disagree because they are committed in the same transaction.
   */
  async end(
    id: string,
    dto: EndSessionDto,
    ctx: ActorContext,
  ): Promise<Session> {
    const endedAt = new Date();

    const { session: result, debtEntry } = await this.dataSource.transaction(
      async (manager) => {
        const session = await this.lockActive(manager, id);

        const due = this.pricing.finalize(session, endedAt);
        const paid = Money.fromMinor(dto.amountPaid);

        if (paid.greaterThan(due)) {
          throw new BusinessRuleException(
            'OVERPAYMENT',
            'Amount paid exceeds the amount due; give change instead',
            { due: due.value, paid: paid.value },
          );
        }

        const shortfall = due.subtract(paid);
        if (shortfall.isPositive() && !session.customerId) {
          throw new BusinessRuleException(
            'DEBT_REQUIRES_CUSTOMER',
            'Cannot leave an unpaid balance without an attached customer',
            { due: due.value, paid: paid.value },
          );
        }

        session.status = SessionStatus.ENDED;
        session.endedAt = endedAt;
        session.amountDue = due.value;
        session.amountPaid = paid.value;
        session.endedBy = ctx.actorId;
        if (dto.notes) {
          session.notes = dto.notes;
        }
        const saved = await manager.save(session);

        let debt: Awaited<ReturnType<typeof this.debt.addDebt>> | null = null;
        if (shortfall.isPositive() && session.customerId) {
          debt = await this.debt.addDebt(
            {
              customerId: session.customerId,
              amount: shortfall.value,
              sessionId: session.id,
              actorId: ctx.actorId,
              reason: `Unpaid balance for session ${session.id}`,
            },
            manager,
          );
        }

        await this.releaseComputer(manager, session.computerId);
        return { session: saved, debtEntry: debt };
      },
    );

    this.events.emit(
      DomainEvent.SessionEnded,
      buildEvent(DomainEvent.SessionEnded, this.toEvent(result)),
    );
    // Announce the debt only after the transaction has committed so the
    // reported balance is authoritative.
    if (debtEntry && result.customerId) {
      await this.debt.announceDebtChange(result.customerId, debtEntry);
    }
    return result;
  }

  /** Cancels an active session with no charge (e.g. opened by mistake). */
  async cancel(id: string, ctx: ActorContext): Promise<Session> {
    const result = await this.dataSource.transaction(async (manager) => {
      const session = await this.lockActive(manager, id);
      session.status = SessionStatus.CANCELLED;
      session.endedAt = new Date();
      session.amountDue = 0;
      session.amountPaid = 0;
      session.endedBy = ctx.actorId;
      const saved = await manager.save(session);
      await this.releaseComputer(manager, session.computerId);
      return saved;
    });

    this.events.emit(
      DomainEvent.SessionEnded,
      buildEvent(DomainEvent.SessionEnded, this.toEvent(result)),
    );
    return result;
  }

  /** Live cost of an active session right now (no mutation). */
  async quote(id: string): Promise<{ amount: number; at: string }> {
    const session = await this.findById(id);
    if (session.status !== SessionStatus.ACTIVE) {
      return { amount: session.amountDue, at: new Date().toISOString() };
    }
    const amount = this.pricing.quote(session, new Date());
    return { amount: amount.value, at: new Date().toISOString() };
  }

  async findById(id: string): Promise<Session> {
    const session = await this.sessions.findOne({
      where: { id },
      relations: { computer: true, customer: true },
    });
    if (!session) {
      throw new ResourceNotFoundException('Session', id);
    }
    return session;
  }

  async findAll(
    query: PaginationQueryDto,
    filters: { status?: SessionStatus; customerId?: string } = {},
  ): Promise<PaginatedResult<Session>> {
    const [items, total] = await this.sessions.findAndCount({
      where: {
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.customerId ? { customerId: filters.customerId } : {}),
      },
      relations: { computer: true, customer: true },
      order: { startedAt: 'DESC' },
      skip: query.skip,
      take: query.limit,
    });
    return paginate(items, total, query);
  }

  async findActive(): Promise<Session[]> {
    return this.sessions.find({
      where: { status: SessionStatus.ACTIVE },
      relations: { computer: true, customer: true },
      order: { startedAt: 'ASC' },
    });
  }

  private async resolveCustomer(
    manager: EntityManager,
    customerId?: string,
  ): Promise<Customer | null> {
    if (!customerId) {
      return null;
    }
    const customer = await manager.findOne(Customer, {
      where: { id: customerId },
    });
    if (!customer) {
      throw new ResourceNotFoundException('Customer', customerId);
    }
    if (customer.isBlocked) {
      throw new BusinessRuleException(
        'CUSTOMER_BLOCKED',
        'This customer is blocked and cannot start sessions',
      );
    }
    return customer;
  }

  private async lockActive(
    manager: EntityManager,
    id: string,
  ): Promise<Session> {
    const session = await manager.findOne(Session, {
      where: { id },
      lock: { mode: 'pessimistic_write' },
    });
    if (!session) {
      throw new ResourceNotFoundException('Session', id);
    }
    if (session.status !== SessionStatus.ACTIVE) {
      throw new ConflictException(
        'SESSION_NOT_ACTIVE',
        `Session is ${session.status} and cannot be modified`,
      );
    }
    return session;
  }

  private async releaseComputer(
    manager: EntityManager,
    computerId: string,
  ): Promise<void> {
    const computer = await manager.findOne(Computer, {
      where: { id: computerId },
      lock: { mode: 'pessimistic_write' },
    });
    if (computer && computer.status === ComputerStatus.IN_USE) {
      computer.status = ComputerStatus.AVAILABLE;
      await manager.save(computer);
    }
  }

  private toEvent(session: Session) {
    return {
      id: session.id,
      groupId: session.groupId,
      computerId: session.computerId,
      customerId: session.customerId,
      type: session.type,
      status: session.status,
      startedAt: session.startedAt,
      plannedEndAt: session.plannedEndAt,
      endedAt: session.endedAt,
      amountDue: session.amountDue,
      amountPaid: session.amountPaid,
    };
  }
}
