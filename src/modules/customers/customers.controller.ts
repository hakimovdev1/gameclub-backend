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
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { ListCustomersQueryDto } from './dto/list-customers.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { Audited } from '../audit/audit.decorator';

@ApiTags('customers')
@ApiBearerAuth()
@Controller('customers')
export class CustomersController {
  constructor(private readonly customers: CustomersService) {}

  @Post()
  @Roles(Role.CASHIER)
  @Audited('CUSTOMER_CREATE', 'Customer')
  @ApiOperation({ summary: 'Create a customer' })
  create(@Body() dto: CreateCustomerDto) {
    return this.customers.create(dto);
  }

  @Get()
  @Roles(Role.CASHIER)
  @ApiOperation({ summary: 'List/search customers' })
  findAll(@Query() query: ListCustomersQueryDto) {
    return this.customers.findAll(query, query.search);
  }

  @Get(':id')
  @Roles(Role.CASHIER)
  @ApiOperation({ summary: 'Get a customer with live debt balance' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.customers.getProfile(id);
  }

  @Patch(':id')
  @Roles(Role.CASHIER)
  @Audited('CUSTOMER_UPDATE', 'Customer')
  @ApiOperation({ summary: 'Update a customer' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customers.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.MANAGER)
  @Audited('CUSTOMER_DELETE', 'Customer')
  @ApiOperation({ summary: 'Soft-delete a customer' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.customers.remove(id);
  }
}
