import { SessionsService } from './sessions.service';
import { StartSessionDto } from './dto/start-session.dto';
import { ExtendSessionDto } from './dto/extend-session.dto';
import { EndSessionDto } from './dto/end-session.dto';
import { SessionStatus } from './entities/session.entity';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
export declare class SessionsController {
    private readonly sessions;
    constructor(sessions: SessionsService);
    start(dto: StartSessionDto, user: AuthenticatedUser): Promise<import("./entities/session.entity").Session[]>;
    findAll(query: PaginationQueryDto, status?: SessionStatus, customerId?: string): Promise<import("../../common/dto/pagination.dto").PaginatedResult<import("./entities/session.entity").Session>>;
    active(): Promise<import("./entities/session.entity").Session[]>;
    findOne(id: string): Promise<import("./entities/session.entity").Session>;
    quote(id: string): Promise<{
        amount: number;
        at: string;
    }>;
    extend(id: string, dto: ExtendSessionDto): Promise<import("./entities/session.entity").Session>;
    end(id: string, dto: EndSessionDto, user: AuthenticatedUser): Promise<import("./entities/session.entity").Session>;
    cancel(id: string, user: AuthenticatedUser): Promise<import("./entities/session.entity").Session>;
}
