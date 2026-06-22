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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ComputersService } from './computers.service';
import { CreateComputerDto } from './dto/create-computer.dto';
import { UpdateComputerDto } from './dto/update-computer.dto';
import { ComputerStatus } from './entities/computer.entity';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { Audited } from '../audit/audit.decorator';

@ApiTags('computers')
@ApiBearerAuth()
@Controller('computers')
export class ComputersController {
  constructor(private readonly computers: ComputersService) {}

  @Post()
  @Roles(Role.MANAGER)
  @Audited('COMPUTER_CREATE', 'Computer')
  @ApiOperation({ summary: 'Register a computer in a room' })
  create(@Body() dto: CreateComputerDto) {
    return this.computers.create(dto);
  }

  @Get()
  @Roles(Role.CASHIER)
  @ApiQuery({ name: 'roomId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ComputerStatus })
  @ApiOperation({ summary: 'List computers' })
  findAll(
    @Query() query: PaginationQueryDto,
    @Query('roomId') roomId?: string,
    @Query('status') status?: ComputerStatus,
  ) {
    return this.computers.findAll(query, { roomId, status });
  }

  @Get(':id')
  @Roles(Role.CASHIER)
  @ApiOperation({ summary: 'Get a computer' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.computers.findById(id);
  }

  @Patch(':id')
  @Roles(Role.MANAGER)
  @Audited('COMPUTER_UPDATE', 'Computer')
  @ApiOperation({ summary: 'Update a computer (status, room, specs)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateComputerDto,
  ) {
    return this.computers.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.MANAGER)
  @Audited('COMPUTER_DELETE', 'Computer')
  @ApiOperation({ summary: 'Soft-delete a computer' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.computers.remove(id);
  }
}
