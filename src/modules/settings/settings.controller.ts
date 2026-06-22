import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import {
  CurrentUser,
  AuthenticatedUser,
} from '../../common/decorators/current-user.decorator';
import { Audited } from '../audit/audit.decorator';

@ApiTags('settings')
@ApiBearerAuth()
@Controller('settings')
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get()
  @Roles(Role.CASHIER)
  @ApiOperation({ summary: 'Get all settings (defaults merged)' })
  getAll() {
    return this.settings.getAll();
  }

  @Put()
  @Roles(Role.OWNER)
  @Audited('SETTING_UPDATE', 'Setting')
  @ApiOperation({ summary: 'Set a configuration value' })
  set(@Body() dto: UpdateSettingDto, @CurrentUser() user: AuthenticatedUser) {
    return this.settings.set(dto.key, dto.value, user.sub);
  }
}
