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
import { DebtService } from './debt.service';
import { CorrectionDto, RecordPaymentDto } from './dto/debt.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import {
  CurrentUser,
  AuthenticatedUser,
} from '../../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { Audited } from '../audit/audit.decorator';

@ApiTags('debt')
@ApiBearerAuth()
@Controller('customers/:customerId/debt')
export class DebtController {
  constructor(private readonly debt: DebtService) {}

  @Get('balance')
  @Roles(Role.CASHIER)
  @ApiOperation({ summary: 'Get the live debt balance for a customer' })
  async balance(@Param('customerId', ParseUUIDPipe) customerId: string) {
    const balance = await this.debt.getBalance(customerId);
    return { customerId, balance: balance.value };
  }

  @Get('ledger')
  @Roles(Role.CASHIER)
  @ApiOperation({ summary: 'List the customer financial ledger' })
  ledger(
    @Param('customerId', ParseUUIDPipe) customerId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.debt.getLedger(customerId, query);
  }

  @Post('payments')
  @Roles(Role.CASHIER)
  @Audited('DEBT_PAYMENT', 'DebtTransaction')
  @ApiOperation({ summary: 'Record a debt payment' })
  recordPayment(
    @Param('customerId', ParseUUIDPipe) customerId: string,
    @Body() dto: RecordPaymentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.debt.recordPayment({
      customerId,
      amount: dto.amount,
      actorId: user.sub,
      reason: dto.reason,
    });
  }

  @Post('corrections')
  @Roles(Role.OWNER)
  @Audited('DEBT_CORRECTION', 'DebtTransaction')
  @ApiOperation({ summary: 'Apply a signed correction (owner only)' })
  correct(
    @Param('customerId', ParseUUIDPipe) customerId: string,
    @Body() dto: CorrectionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.debt.correct(
      customerId,
      dto.signedAmount,
      user.sub,
      dto.reason,
    );
  }
}
