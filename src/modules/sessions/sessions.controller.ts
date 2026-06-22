import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SessionsService } from './sessions.service';
import { StartSessionDto } from './dto/start-session.dto';
import { ExtendSessionDto } from './dto/extend-session.dto';
import { EndSessionDto } from './dto/end-session.dto';
import { ListSessionsQueryDto } from './dto/list-sessions.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import {
  CurrentUser,
  AuthenticatedUser,
} from '../../common/decorators/current-user.decorator';
import { Audited } from '../audit/audit.decorator';

@ApiTags('sessions')
@ApiBearerAuth()
@Controller('sessions')
@Roles(Role.CASHIER)
export class SessionsController {
  constructor(private readonly sessions: SessionsService) {}

  @Post()
  @Audited('SESSION_START', 'Session')
  @ApiOperation({ summary: 'Start a session or an atomic group session' })
  start(@Body() dto: StartSessionDto, @CurrentUser() user: AuthenticatedUser) {
    return this.sessions.start(dto, { actorId: user.sub });
  }

  @Get()
  @ApiOperation({ summary: 'List sessions' })
  findAll(@Query() query: ListSessionsQueryDto) {
    return this.sessions.findAll(query, {
      status: query.status,
      customerId: query.customerId,
    });
  }

  @Get('active')
  @ApiOperation({ summary: 'List currently active sessions' })
  active() {
    return this.sessions.findActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a session' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.sessions.findById(id);
  }

  @Get(':id/quote')
  @ApiOperation({ summary: 'Live running cost of an active session' })
  quote(@Param('id', ParseUUIDPipe) id: string) {
    return this.sessions.quote(id);
  }

  @Post(':id/extend')
  @Audited('SESSION_EXTEND', 'Session')
  @ApiOperation({ summary: 'Extend a fixed session' })
  extend(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ExtendSessionDto,
  ) {
    return this.sessions.extend(id, dto);
  }

  @Post(':id/end')
  @Audited('SESSION_END', 'Session')
  @ApiOperation({ summary: 'End a session, take payment, settle debt' })
  end(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: EndSessionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.sessions.end(id, dto, { actorId: user.sub });
  }

  @Post(':id/cancel')
  @Audited('SESSION_CANCEL', 'Session')
  @ApiOperation({ summary: 'Cancel an active session with no charge' })
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.sessions.cancel(id, { actorId: user.sub });
  }
}
