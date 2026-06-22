import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBooleanString, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

/**
 * Query for listing notifications. Whitelists the optional `unreadOnly` flag so
 * it passes the global `forbidNonWhitelisted` validation.
 */
export class ListNotificationsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @IsBooleanString()
  unreadOnly?: string;
}
