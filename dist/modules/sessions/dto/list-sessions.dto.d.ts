import { PaginationQueryDto } from '../../../common/dto/pagination.dto';
import { SessionStatus } from '../entities/session.entity';
export declare class ListSessionsQueryDto extends PaginationQueryDto {
    status?: SessionStatus;
    customerId?: string;
}
