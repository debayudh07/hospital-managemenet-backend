import { Module } from '@nestjs/common';
import { TransfersService } from './transfers.service';
import { TransfersController } from './transfers.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  providers: [TransfersService, PrismaService],
  controllers: [TransfersController],
  exports: [TransfersService]
})
export class TransfersModule {}
