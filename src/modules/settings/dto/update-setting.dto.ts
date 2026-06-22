import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsString, MaxLength } from 'class-validator';

export class UpdateSettingDto {
  @ApiProperty({ example: 'club.name' })
  @IsString()
  @MaxLength(80)
  key: string;

  @ApiProperty({ description: 'Any JSON-serialisable value' })
  @IsDefined()
  value: unknown;
}
