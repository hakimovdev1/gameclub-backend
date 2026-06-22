import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from './entities/session.entity';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { SessionPricingService } from './session-pricing.service';
import { DebtModule } from '../debt/debt.module';

@Module({
  imports: [TypeOrmModule.forFeature([Session]), DebtModule],
  controllers: [SessionsController],
  providers: [SessionsService, SessionPricingService],
  exports: [SessionsService, SessionPricingService],
})
export class SessionsModule {}
