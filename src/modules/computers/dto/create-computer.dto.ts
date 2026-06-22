import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateComputerDto {
  @ApiProperty({ example: 'PC-01' })
  @IsString()
  @MaxLength(40)
  label: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  roomId: string;

  @ApiPropertyOptional({
    example: { cpu: 'i5-12400F', gpu: 'RTX 3060', ram: '16GB' },
  })
  @IsOptional()
  @IsObject()
  specs?: Record<string, unknown>;
}
