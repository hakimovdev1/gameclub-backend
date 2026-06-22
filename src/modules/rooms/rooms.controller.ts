import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { Audited } from '../audit/audit.decorator';

@ApiTags('rooms')
@ApiBearerAuth()
@Controller('rooms')
export class RoomsController {
  constructor(private readonly rooms: RoomsService) {}

  @Post()
  @Roles(Role.MANAGER)
  @Audited('ROOM_CREATE', 'Room')
  @ApiOperation({ summary: 'Create a pricing room' })
  create(@Body() dto: CreateRoomDto) {
    return this.rooms.create(dto);
  }

  @Get()
  @Roles(Role.CASHIER)
  @ApiOperation({ summary: 'List rooms' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.rooms.findAll(query);
  }

  @Get(':id')
  @Roles(Role.CASHIER)
  @ApiOperation({ summary: 'Get a room' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.rooms.findById(id);
  }

  @Patch(':id')
  @Roles(Role.MANAGER)
  @Audited('ROOM_UPDATE', 'Room')
  @ApiOperation({ summary: 'Update a room (incl. pricing)' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateRoomDto) {
    return this.rooms.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.MANAGER)
  @Audited('ROOM_DELETE', 'Room')
  @ApiOperation({ summary: 'Soft-delete a room' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.rooms.remove(id);
  }
}
