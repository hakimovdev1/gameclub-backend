import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DebtTransaction } from './entities/debt-transaction.entity';
import { DebtService } from './debt.service';
import { DebtController } from './debt.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DebtTransaction])],
  controllers: [DebtController],
  providers: [DebtService],
  exports: [DebtService],
})
export class DebtModule {}
