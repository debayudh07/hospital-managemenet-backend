import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Put, 
  Query,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import type { CreateOPDBillingDto, UpdateOPDBillingDto, PaymentDto } from './billing.service';
import { BillingService } from './billing.service';

@Controller('opd/billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createOPDBillingDto: CreateOPDBillingDto) {
    return this.billingService.create(createOPDBillingDto);
  }

  @Get('visit/:opdVisitId')
  async findByVisitId(@Param('opdVisitId') opdVisitId: string) {
    return this.billingService.findByVisitId(opdVisitId);
  }

  @Get('pending')
  async getPendingPayments(
    @Query('departmentId') departmentId?: string,
    @Query('doctorId') doctorId?: string
  ) {
    return this.billingService.getPendingPayments(departmentId, doctorId);
  }

  @Get('collections/daily')
  async getDailyCollections(@Query('date') date?: string) {
    return this.billingService.getDailyCollections(date);
  }

  @Get('payment-methods/summary')
  async getPaymentMethodSummary(
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string
  ) {
    return this.billingService.getPaymentMethodSummary(fromDate, toDate);
  }

  @Get()
  async findAll(
    @Query('status') status?: string,
    @Query('departmentId') departmentId?: string,
    @Query('doctorId') doctorId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string
  ) {
    return this.billingService.findAll({
      status,
      departmentId,
      doctorId,
      fromDate,
      toDate
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.billingService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateOPDBillingDto: UpdateOPDBillingDto
  ) {
    return this.billingService.update(id, updateOPDBillingDto);
  }

  @Post(':id/payment')
  @HttpCode(HttpStatus.OK)
  async recordPayment(
    @Param('id') id: string,
    @Body() paymentDto: PaymentDto
  ) {
    return this.billingService.recordPayment(id, paymentDto);
  }
}
