import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('analytics')
@ApiBearerAuth()
@Controller('analytics')
@Roles(Role.MANAGER)
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Aggregated business KPIs for a date range' })
  summary(@Query() query: AnalyticsQueryDto) {
    return this.analytics.summary(query.resolveRange());
  }
}
