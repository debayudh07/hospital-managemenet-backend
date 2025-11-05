import { Module } from '@nestjs/common';
import { TreatmentsService } from './treatments.service';
import { TreatmentsController } from './treatments.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  providers: [TreatmentsService, PrismaService],
  controllers: [TreatmentsController],
  exports: [TreatmentsService]
})
export class TreatmentsModule {}
