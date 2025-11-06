import { Module } from '@nestjs/common';
import { LabService } from './lab.service';
import { LabController } from './lab.controller';
import { LabReportService } from './lab-report.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [LabService, LabReportService, PrismaService],
  controllers: [LabController],
  exports: [LabService, LabReportService]
})
export class LabModule {}
