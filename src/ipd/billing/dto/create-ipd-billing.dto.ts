import { IsString, IsNumber, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class CreateIPDBillingDto {
  @IsString()
  admissionId: string;

  @IsOptional()
  @IsNumber()
  bedCharges?: number;

  @IsOptional()
  @IsNumber()
  roomCharges?: number;

  @IsOptional()
  @IsNumber()
  icuCharges?: number;

  @IsOptional()
  @IsNumber()
  nursingCharges?: number;

  @IsOptional()
  @IsNumber()
  doctorFees?: number;

  @IsOptional()
  @IsNumber()
  consultationFees?: number;

  @IsOptional()
  @IsNumber()
  procedureFees?: number;

  @IsOptional()
  @IsNumber()
  surgeryFees?: number;

  @IsOptional()
  @IsNumber()
  labCharges?: number;

  @IsOptional()
  @IsNumber()
  radiologyCharges?: number;

  @IsOptional()
  @IsNumber()
  pathologyCharges?: number;

  @IsOptional()
  @IsNumber()
  medicineCharges?: number;

  @IsOptional()
  @IsNumber()
  injectionCharges?: number;

  @IsOptional()
  @IsNumber()
  equipmentCharges?: number;

  @IsOptional()
  @IsNumber()
  miscellaneousCharges?: number;

  @IsOptional()
  @IsNumber()
  ambulanceCharges?: number;

  @IsOptional()
  @IsNumber()
  discount?: number;

  @IsOptional()
  @IsNumber()
  tax?: number;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsNumber()
  paidAmount?: number;

  @IsOptional()
  @IsNumber()
  depositAmount?: number;

  @IsOptional()
  @IsNumber()
  insuranceClaimed?: number;

  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}