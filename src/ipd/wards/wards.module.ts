import { Module } from '@nestjs/common';
import { WardsService } from './wards.service';
import { WardsController } from './wards.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  providers: [WardsService, PrismaService],
  controllers: [WardsController],
  exports: [WardsService]
})
export class WardsModule {}
