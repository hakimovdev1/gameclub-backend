import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';
import { SessionStatus } from '../entities/session.entity';

/**
 * Query for listing sessions. Extends pagination with the optional filters the
 * controller supports, so they pass the global `forbidNonWhitelisted`
 * validation instead of being rejected as unknown query properties.
 */
export class ListSessionsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: SessionStatus })
  @IsOptional()
  @IsEnum(SessionStatus)
  status?: SessionStatus;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  customerId?: string;
}
