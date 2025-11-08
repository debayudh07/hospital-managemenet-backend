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
import { IPDBillingService } from './billing.service';
import { CreateIPDBillingDto, UpdateIPDBillingDto, PaymentDto, AddChargeDto, DailyChargeDto } from './dto';

@Controller('ipd/billing')
export class IPDBillingController {
  constructor(private readonly billingService: IPDBillingService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createIPDBillingDto: CreateIPDBillingDto) {
    return this.billingService.create(createIPDBillingDto);
  }

  @Get('admission/:admissionId')
  async findByAdmissionId(@Param('admissionId') admissionId: string) {
    return this.billingService.findByAdmissionId(admissionId);
  }

  @Get('pending')
  async getPendingPayments(
    @Query('wardId') wardId?: string,
    @Query('departmentId') departmentId?: string
  ) {
    return this.billingService.getPendingPayments(wardId, departmentId);
  }

  @Get('completed')
  async getCompletedPayments(
    @Query('wardId') wardId?: string,
    @Query('departmentId') departmentId?: string
  ) {
    return this.billingService.getCompletedPayments(wardId, departmentId);
  }

  @Get()
  async findAll(
    @Query('status') status?: string,
    @Query('wardId') wardId?: string,
    @Query('departmentId') departmentId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string
  ) {
    return this.billingService.findAll({
      status,
      wardId,
      departmentId,
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
    @Body() updateIPDBillingDto: UpdateIPDBillingDto
  ) {
    return this.billingService.update(id, updateIPDBillingDto);
  }

  @Post(':id/payment')
  @HttpCode(HttpStatus.OK)
  async recordPayment(
    @Param('id') id: string,
    @Body() paymentDto: PaymentDto
  ) {
    return this.billingService.recordPayment(id, paymentDto);
  }

  @Post(':id/charge')
  @HttpCode(HttpStatus.OK)
  async addCharge(
    @Param('id') id: string,
    @Body() addChargeDto: AddChargeDto
  ) {
    return this.billingService.addCharge(id, addChargeDto);
  }

  @Post('daily-charges')
  @HttpCode(HttpStatus.OK)
  async applyDailyCharges(@Body() dailyChargeDto: DailyChargeDto) {
    return this.billingService.applyDailyCharges(dailyChargeDto);
  }

  @Post('trigger-daily-charges')
  @HttpCode(HttpStatus.OK)
  async triggerDailyCharges() {
    await this.billingService.handleDailyCharges();
    return { message: 'Daily charges applied successfully' };
  }
}
