import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

@ApiTags('audit')
@ApiBearerAuth()
@Controller('audit-logs')
@Roles(Role.OWNER)
export class AuditController {
  constructor(private readonly audit: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'List immutable audit log entries' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.audit.findAll(query);
  }
}
