import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Computer } from './entities/computer.entity';
import { ComputersService } from './computers.service';
import { ComputersController } from './computers.controller';
import { RoomsModule } from '../rooms/rooms.module';

@Module({
  imports: [TypeOrmModule.forFeature([Computer]), RoomsModule],
  controllers: [ComputersController],
  providers: [ComputersService],
  exports: [ComputersService, TypeOrmModule],
})
export class ComputersModule {}
