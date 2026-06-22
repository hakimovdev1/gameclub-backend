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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { Audited } from '../audit/audit.decorator';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@Roles(Role.OWNER)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a staff account' })
  @Audited('USER_CREATE', 'User')
  create(@Body() dto: CreateUserDto) {
    return this.users.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List staff accounts' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.users.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a staff account' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.users.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a staff account' })
  @Audited('USER_UPDATE', 'User')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserDto) {
    return this.users.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate (soft delete) a staff account' })
  @Audited('USER_DELETE', 'User')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.users.remove(id);
  }
}
