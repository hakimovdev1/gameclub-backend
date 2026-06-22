import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsInt, IsOptional, Max, Min } from 'class-validator';

export class ExtendSessionDto {
  @ApiPropertyOptional({
    example: 30,
    description: 'For FIXED_DURATION: additional minutes.',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(24 * 60)
  addMinutes?: number;

  @ApiPropertyOptional({
    description: 'For FIXED_END_TIME: the new (later) end time.',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  newEndAt?: Date;
}
