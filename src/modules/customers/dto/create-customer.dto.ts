import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({ example: 'Bobur Aliyev' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  fullName: string;

  @ApiPropertyOptional({ example: '+998901234567' })
  @IsOptional()
  @IsString()
  @Matches(/^\+?\d{7,15}$/, { message: 'phone must be a valid number' })
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  note?: string;
}
