import { IsNumber, IsString, IsOptional, IsEnum } from 'class-validator';

export enum PreAuthStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED'
}

export class CreatePreAuthDto {
  @IsString()
  admissionId: string;

  @IsString()
  policyNumber: string;

  @IsString()
  insuranceProvider: string;

  @IsString()
  @IsOptional()
  tpaName?: string;

  @IsNumber()
  estimatedAmount: number;

  @IsString()
  diagnosisCode: string;

  @IsString()
  treatmentCode: string;

  @IsString()
  @IsOptional()
  remarks?: string;

  @IsString()
  @IsOptional()
  urgency?: string; // Emergency, Planned, etc.
}

export class UpdatePreAuthDto {
  @IsOptional()
  @IsEnum(PreAuthStatus)
  status?: PreAuthStatus;

  @IsOptional()
  @IsNumber()
  approvedAmount?: number;

  @IsOptional()
  @IsString()
  preAuthNumber?: string;

  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @IsOptional()
  @IsString()
  reviewedBy?: string;

  @IsOptional()
  @IsString()
  validityPeriod?: string; // e.g., "30 days"

  @IsOptional()
  @IsString()
  conditions?: string;
}

export class ApplyInsuranceDto {
  @IsString()
  admissionId: string;

  @IsString()
  claimId: string;

  @IsNumber()
  @IsOptional()
  amountToApply?: number; // If not provided, applies full approved amount
}