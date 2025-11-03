import { Module } from '@nestjs/common';
import { IpdService } from './ipd.service';
import { IpdController } from './ipd.controller';
import { AdmissionsModule } from './admissions/admissions.module';
import { WardsModule } from './wards/wards.module';
import { VitalsModule } from './vitals/vitals.module';
import { TreatmentsModule } from './treatments/treatments.module';
import { TransfersModule } from './transfers/transfers.module';
import { DischargeModule } from './discharge/discharge.module';

@Module({
  providers: [IpdService],
  controllers: [IpdController],
  imports: [AdmissionsModule, WardsModule, VitalsModule, TreatmentsModule, TransfersModule, DischargeModule]
})
export class IpdModule {}
