import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './entities/room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import {
  ConflictException,
  ResourceNotFoundException,
} from '../../common/exceptions/domain.exception';
import {
  PaginatedResult,
  PaginationQueryDto,
  paginate,
} from '../../common/dto/pagination.dto';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private readonly rooms: Repository<Room>,
  ) {}

  async create(dto: CreateRoomDto): Promise<Room> {
    if (await this.rooms.exists({ where: { name: dto.name } })) {
      throw new ConflictException(
        'ROOM_NAME_TAKEN',
        'A room with this name already exists',
      );
    }
    return this.rooms.save(this.rooms.create(dto));
  }

  async findAll(query: PaginationQueryDto): Promise<PaginatedResult<Room>> {
    const [items, total] = await this.rooms.findAndCount({
      order: { name: 'ASC' },
      skip: query.skip,
      take: query.limit,
    });
    return paginate(items, total, query);
  }

  async findById(id: string): Promise<Room> {
    const room = await this.rooms.findOne({ where: { id } });
    if (!room) {
      throw new ResourceNotFoundException('Room', id);
    }
    return room;
  }

  async update(id: string, dto: UpdateRoomDto): Promise<Room> {
    const room = await this.findById(id);
    Object.assign(room, dto);
    return this.rooms.save(room);
  }

  async remove(id: string): Promise<void> {
    const room = await this.findById(id);
    await this.rooms.softRemove(room);
  }
}
