import { Module } from '@nestjs/common';
import { OpdService } from './opd.service';
import { OpdController } from './opd.controller';
import { VisitsModule } from './visits/visits.module';
import { VitalsModule } from './vitals/vitals.module';
import { PrescriptionsModule } from './prescriptions/prescriptions.module';
import { BillingModule } from './billing/billing.module';

@Module({
  providers: [OpdService],
  controllers: [OpdController],
  imports: [VisitsModule, VitalsModule, PrescriptionsModule, BillingModule]
})
export class OpdModule {}
