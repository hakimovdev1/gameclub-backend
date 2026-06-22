import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Role } from '../../../common/enums/role.enum';

export class CreateUserDto {
  @ApiProperty({ example: 'cashier@club.uz' })
  @IsEmail()
  @MaxLength(160)
  email: string;

  @ApiProperty({ example: 'Aziz Karimov' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  fullName: string;

  @ApiProperty({ example: 'Str0ng-Passw0rd!', minLength: 10 })
  @IsString()
  @MinLength(10)
  @MaxLength(128)
  @Matches(/[A-Za-z]/, { message: 'Password must contain a letter' })
  @Matches(/\d/, { message: 'Password must contain a digit' })
  password: string;

  @ApiProperty({ enum: Role, default: Role.CASHIER })
  @IsEnum(Role)
  role: Role;
}
