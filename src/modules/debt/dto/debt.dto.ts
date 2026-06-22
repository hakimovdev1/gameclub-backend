import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
  NotEquals,
} from 'class-validator';

export class RecordPaymentDto {
  @ApiProperty({ example: 20000, description: 'Positive minor units' })
  @IsInt()
  @Min(1)
  amount: number;

  @ApiProperty({ required: false, example: 'Cash payment at desk' })
  @IsString()
  @MaxLength(255)
  reason: string;
}

export class CorrectionDto {
  @ApiProperty({
    example: -5000,
    description: 'Signed minor units; negative reduces debt',
  })
  @IsInt()
  @NotEquals(0)
  signedAmount: number;

  @ApiProperty({ example: 'Goodwill adjustment, approved by owner' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  reason: string;
}
