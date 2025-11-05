import { Module } from '@nestjs/common';
import { VitalsService } from './vitals.service';
import { VitalsController } from './vitals.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  providers: [VitalsService, PrismaService],
  controllers: [VitalsController],
  exports: [VitalsService]
})
export class VitalsModule {}
