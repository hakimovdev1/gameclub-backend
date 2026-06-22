import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';

export class AnalyticsQueryDto {
  @ApiPropertyOptional({ description: 'Range start (ISO 8601). Default: -30d' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  from?: Date;

  @ApiPropertyOptional({ description: 'Range end (ISO 8601). Default: now' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  to?: Date;

  resolveRange(): { from: Date; to: Date } {
    const to = this.to ?? new Date();
    const from = this.from ?? new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
    return { from, to };
  }
}
