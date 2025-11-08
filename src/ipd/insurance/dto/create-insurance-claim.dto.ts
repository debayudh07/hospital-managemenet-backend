import { IsString, IsNumber, IsOptional, IsEnum, IsDateString, IsBoolean } from 'class-validator';

export enum ClaimStatus {
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PARTIALLY_APPROVED = 'PARTIALLY_APPROVED'
}

export enum ClaimType {
  CASHLESS = 'CASHLESS',
  REIMBURSEMENT = 'REIMBURSEMENT'
}

export class CreateInsuranceClaimDto {
  @IsString()
  admissionId: string;

  @IsString()
  policyNumber: string;

  @IsString()
  insuranceProvider: string;

  @IsString()
  @IsOptional()
  tpaName?: string;

  @IsEnum(ClaimType)
  claimType: ClaimType;

  @IsNumber()
  claimedAmount: number;

  @IsString()
  @IsOptional()
  diagnosisCode?: string;

  @IsString()
  @IsOptional()
  treatmentCode?: string;

  @IsString()
  @IsOptional()
  preAuthNumber?: string;

  @IsDateString()
  @IsOptional()
  preAuthDate?: string;

  @IsNumber()
  @IsOptional()
  preAuthAmount?: number;

  @IsString()
  @IsOptional()
  remarks?: string;

  @IsString()
  @IsOptional()
  attachments?: string; // JSON array of file paths

  @IsBoolean()
  @IsOptional()
  isEmergency?: boolean;

  @IsString()
  @IsOptional()
  contactPerson?: string;

  @IsString()
  @IsOptional()
  contactPhone?: string;

  @IsString()
  @IsOptional()
  urgency?: string;
}