import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { DebtModule } from '../debt/debt.module';

@Module({
  imports: [TypeOrmModule.forFeature([Customer]), DebtModule],
  controllers: [CustomersController],
  providers: [CustomersService],
  exports: [CustomersService],
})
export class CustomersModule {}
