import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { Session } from '../sessions/entities/session.entity';
import { Computer } from '../computers/entities/computer.entity';
import { Customer } from '../customers/entities/customer.entity';
import { DebtModule } from '../debt/debt.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Session, Computer, Customer]),
    DebtModule,
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
