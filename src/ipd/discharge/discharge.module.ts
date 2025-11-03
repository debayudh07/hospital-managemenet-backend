import { Module } from '@nestjs/common';
import { DischargeService } from './discharge.service';
import { DischargeController } from './discharge.controller';

@Module({
  providers: [DischargeService],
  controllers: [DischargeController]
})
export class DischargeModule {}
