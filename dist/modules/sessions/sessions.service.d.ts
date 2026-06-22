import { EventEmitter2 } from '@nestjs/event-emitter';
import { DataSource, Repository } from 'typeorm';
import { Session, SessionStatus } from './entities/session.entity';
import { SessionPricingService } from './session-pricing.service';
import { DebtService } from '../debt/debt.service';
import { StartSessionDto } from './dto/start-session.dto';
import { ExtendSessionDto } from './dto/extend-session.dto';
import { EndSessionDto } from './dto/end-session.dto';
import { PaginatedResult, PaginationQueryDto } from '../../common/dto/pagination.dto';
interface ActorContext {
    actorId: string;
}
export declare class SessionsService {
    private readonly sessions;
    private readonly dataSource;
    private readonly pricing;
    private readonly debt;
    private readonly events;
    constructor(sessions: Repository<Session>, dataSource: DataSource, pricing: SessionPricingService, debt: DebtService, events: EventEmitter2);
    start(dto: StartSessionDto, ctx: ActorContext): Promise<Session[]>;
    extend(id: string, dto: ExtendSessionDto): Promise<Session>;
    end(id: string, dto: EndSessionDto, ctx: ActorContext): Promise<Session>;
    cancel(id: string, ctx: ActorContext): Promise<Session>;
    quote(id: string): Promise<{
        amount: number;
        at: string;
    }>;
    findById(id: string): Promise<Session>;
    findAll(query: PaginationQueryDto, filters?: {
        status?: SessionStatus;
        customerId?: string;
    }): Promise<PaginatedResult<Session>>;
    findActive(): Promise<Session[]>;
    private resolveCustomer;
    private lockActive;
    private releaseComputer;
    private toEvent;
}
export {};
