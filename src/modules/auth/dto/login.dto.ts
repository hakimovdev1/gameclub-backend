import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'owner@club.uz' })
  @IsEmail()
  @MaxLength(160)
  email: string;

  @ApiProperty({ example: 'Str0ng-Passw0rd!' })
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  password: string;
}
