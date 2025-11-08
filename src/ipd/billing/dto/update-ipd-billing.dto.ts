import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsNumber, IsDateString } from 'class-validator';
import { CreateIPDBillingDto } from './create-ipd-billing.dto';

export class UpdateIPDBillingDto extends PartialType(CreateIPDBillingDto) {
  @IsOptional()
  @IsNumber()
  dayCount?: number;

  @IsOptional()
  @IsDateString()
  lastChargeDate?: string;

  @IsOptional()
  @IsNumber()
  insuranceApproved?: number;

  @IsOptional()
  @IsNumber()
  insurancePending?: number;

  @IsOptional()
  @IsNumber()
  refundAmount?: number;

  @IsOptional()
  @IsNumber()
  balanceAmount?: number;
}