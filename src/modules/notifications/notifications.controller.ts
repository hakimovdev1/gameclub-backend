import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { ListNotificationsQueryDto } from './dto/list-notifications.dto';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
@Roles(Role.CASHIER)
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List notifications' })
  findAll(@Query() query: ListNotificationsQueryDto) {
    return this.notifications.findAll(query, query.unreadOnly === 'true');
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  async markRead(@Param('id', ParseUUIDPipe) id: string) {
    await this.notifications.markRead(id);
    return { read: true };
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllRead() {
    await this.notifications.markAllRead();
    return { read: true };
  }
}
