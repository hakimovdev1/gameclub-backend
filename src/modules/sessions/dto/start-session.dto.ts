import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { SessionType } from '../entities/session.entity';

export class StartSessionDto {
  @ApiProperty({
    type: [String],
    description:
      'One or more computers. Multiple ids create an atomic group session.',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsUUID('4', { each: true })
  computerIds: string[];

  @ApiProperty({ enum: SessionType })
  @IsEnum(SessionType)
  type: SessionType;

  @ApiPropertyOptional({ format: 'uuid', description: 'Attach to a customer' })
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiPropertyOptional({
    example: 60,
    description: 'Required for FIXED_DURATION. Minutes of play.',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(24 * 60)
  durationMinutes?: number;

  @ApiPropertyOptional({
    description: 'Required for FIXED_END_TIME (ISO 8601).',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  plannedEndAt?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  notes?: string;
}
