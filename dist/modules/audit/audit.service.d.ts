import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { PaginatedResult, PaginationQueryDto } from '../../common/dto/pagination.dto';
export interface AuditEntryInput {
    actorId?: string | null;
    actorEmail?: string | null;
    action: string;
    entity: string;
    entityId?: string | null;
    oldValue?: unknown;
    newValue?: unknown;
    ipAddress?: string | null;
    userAgent?: string | null;
    requestId?: string | null;
}
export declare class AuditService {
    private readonly logs;
    private readonly logger;
    constructor(logs: Repository<AuditLog>);
    record(entry: AuditEntryInput): Promise<void>;
    findAll(query: PaginationQueryDto): Promise<PaginatedResult<AuditLog>>;
    private redact;
}
