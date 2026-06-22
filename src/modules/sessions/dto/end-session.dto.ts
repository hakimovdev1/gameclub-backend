import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class EndSessionDto {
  @ApiPropertyOptional({
    example: 50000,
    description:
      'Amount collected now (minor units). Omit to settle the session in ' +
      'full (the default) — no debt is ever created automatically. When an ' +
      'explicit amount below the total is sent, the shortfall is moved to ' +
      "the customer's debt ledger (requires an attached customer).",
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  amountPaid?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  notes?: string;
}
