import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TokenService } from './services/token.service';
import { PasswordService } from './services/password.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken]),
    JwtModule.register({}),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, TokenService, PasswordService],
  exports: [TokenService, PasswordService],
})
export class AuthModule {}
