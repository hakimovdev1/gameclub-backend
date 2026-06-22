import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @MaxLength(128)
  currentPassword: string;

  @ApiProperty({ minLength: 10 })
  @IsString()
  @MinLength(10)
  @MaxLength(128)
  @Matches(/[A-Za-z]/, { message: 'Password must contain a letter' })
  @Matches(/\d/, { message: 'Password must contain a digit' })
  newPassword: string;
}
