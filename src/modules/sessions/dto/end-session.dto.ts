import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class EndSessionDto {
  @ApiProperty({
    example: 50000,
    description:
      'Amount collected now (minor units). Any shortfall is moved to the ' +
      "customer's debt ledger (requires an attached customer).",
  })
  @IsInt()
  @Min(0)
  amountPaid: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  notes?: string;
}
