import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Computer, ComputerStatus } from './entities/computer.entity';
import { CreateComputerDto } from './dto/create-computer.dto';
import { UpdateComputerDto } from './dto/update-computer.dto';
import { RoomsService } from '../rooms/rooms.service';
import { ResourceNotFoundException } from '../../common/exceptions/domain.exception';
import {
  PaginatedResult,
  PaginationQueryDto,
  paginate,
} from '../../common/dto/pagination.dto';
import { DomainEvent, buildEvent } from '../realtime/realtime.events';

@Injectable()
export class ComputersService {
  constructor(
    @InjectRepository(Computer)
    private readonly computers: Repository<Computer>,
    private readonly rooms: RoomsService,
    private readonly events: EventEmitter2,
  ) {}

  async create(dto: CreateComputerDto): Promise<Computer> {
    await this.rooms.findById(dto.roomId); // validates existence
    const computer = await this.computers.save(this.computers.create(dto));
    this.events.emit(
      DomainEvent.ComputerCreated,
      buildEvent(DomainEvent.ComputerCreated, this.toEvent(computer)),
    );
    return computer;
  }

  async findAll(
    query: PaginationQueryDto,
    filters: { roomId?: string; status?: ComputerStatus } = {},
  ): Promise<PaginatedResult<Computer>> {
    const [items, total] = await this.computers.findAndCount({
      where: {
        ...(filters.roomId ? { roomId: filters.roomId } : {}),
        ...(filters.status ? { status: filters.status } : {}),
      },
      relations: { room: true },
      order: { label: 'ASC' },
      skip: query.skip,
      take: query.limit,
    });
    return paginate(items, total, query);
  }

  async findById(id: string): Promise<Computer> {
    const computer = await this.computers.findOne({
      where: { id },
      relations: { room: true },
    });
    if (!computer) {
      throw new ResourceNotFoundException('Computer', id);
    }
    return computer;
  }

  async update(id: string, dto: UpdateComputerDto): Promise<Computer> {
    const computer = await this.findById(id);
    if (dto.roomId && dto.roomId !== computer.roomId) {
      await this.rooms.findById(dto.roomId);
    }
    Object.assign(computer, dto);
    const saved = await this.computers.save(computer);
    this.events.emit(
      DomainEvent.ComputerUpdated,
      buildEvent(DomainEvent.ComputerUpdated, this.toEvent(saved)),
    );
    return saved;
  }

  async remove(id: string): Promise<void> {
    const computer = await this.findById(id);
    await this.computers.softRemove(computer);
  }

  private toEvent(computer: Computer) {
    return {
      id: computer.id,
      label: computer.label,
      roomId: computer.roomId,
      status: computer.status,
    };
  }
}
