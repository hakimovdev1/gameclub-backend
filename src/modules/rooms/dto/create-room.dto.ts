import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({ example: 'VIP Zone' })
  @IsString()
  @MaxLength(80)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiProperty({
    example: 15000,
    description: "Hourly rate in integer minor units (so'm). No decimals.",
  })
  @IsInt()
  @Min(0)
  pricePerHour: number;
}
