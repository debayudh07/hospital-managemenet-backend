import { IsNumber, IsEnum, IsOptional, IsString } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class PaymentDto {
  @IsNumber()
  amount: number;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class AddChargeDto {
  @IsString()
  chargeType: string; // 'bed', 'room', 'doctor', 'lab', etc.

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;
}

export class DailyChargeDto {
  @IsString()
  admissionId: string;

  @IsOptional()
  @IsString()
  chargeDate?: string; // If not provided, uses current date
}