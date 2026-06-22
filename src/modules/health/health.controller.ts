import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';

/**
 * Liveness and readiness probes for orchestrators/load balancers.
 * `/health` is always cheap; `/health/ready` verifies the database round
 * trips before declaring the instance ready to receive traffic.
 */
@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Liveness probe' })
  live() {
    return { status: 'ok', uptime: process.uptime() };
  }

  @Public()
  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe (checks the database)' })
  async ready() {
    let database = 'down';
    try {
      await this.dataSource.query('SELECT 1');
      database = 'up';
    } catch {
      database = 'down';
    }
    if (database !== 'up') {
      // Signal NOT ready with 503 so load balancers stop routing traffic.
      throw new ServiceUnavailableException({
        status: 'degraded',
        checks: { database },
      });
    }
    return { status: 'ok', checks: { database } };
  }
}
