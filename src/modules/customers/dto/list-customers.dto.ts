import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

/**
 * Query for listing/searching customers. Extends pagination with the optional
 * `search` term so it survives the global `forbidNonWhitelisted` validation.
 */
export class ListCustomersQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Name or phone fragment' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;
}
