import { Module } from '@nestjs/common';
import { IPDBillingController } from './billing.controller';
import { IPDBillingService } from './billing.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [IPDBillingController],
  providers: [IPDBillingService],
  exports: [IPDBillingService]
})
export class IPDBillingModule {}
