import { Module } from '@nestjs/common';
import { DischargeService } from './discharge.service';
import { DischargeController } from './discharge.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  providers: [DischargeService, PrismaService],
  controllers: [DischargeController],
  exports: [DischargeService]
})
export class DischargeModule {}
