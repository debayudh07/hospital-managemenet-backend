import { Module } from '@nestjs/common';
import { InsuranceService } from './insurance.service';
import { InsuranceController } from './insurance.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { IPDBillingModule } from '../billing/billing.module';

@Module({
  imports: [PrismaModule, IPDBillingModule],
  controllers: [InsuranceController],
  providers: [InsuranceService],
  exports: [InsuranceService]
})
export class InsuranceModule {}
