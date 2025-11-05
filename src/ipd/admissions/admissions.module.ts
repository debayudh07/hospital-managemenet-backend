import { Module } from '@nestjs/common';
import { AdmissionsService } from './admissions.service';
import { AdmissionsController } from './admissions.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  providers: [AdmissionsService, PrismaService],
  controllers: [AdmissionsController],
  exports: [AdmissionsService]
})
export class AdmissionsModule {}
