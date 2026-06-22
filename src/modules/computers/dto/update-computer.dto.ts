import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { CreateComputerDto } from './create-computer.dto';
import { ComputerStatus } from '../entities/computer.entity';

export class UpdateComputerDto extends PartialType(CreateComputerDto) {
  @ApiPropertyOptional({ enum: ComputerStatus })
  @IsOptional()
  @IsEnum(ComputerStatus)
  status?: ComputerStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
