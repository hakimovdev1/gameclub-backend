import { AuditService } from './audit.service';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
export declare class AuditController {
    private readonly audit;
    constructor(audit: AuditService);
    findAll(query: PaginationQueryDto): Promise<import("../../common/dto/pagination.dto").PaginatedResult<import("./entities/audit-log.entity").AuditLog>>;
}
