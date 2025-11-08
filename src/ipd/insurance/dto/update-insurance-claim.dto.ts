import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsNumber, IsEnum, IsDateString, IsString } from 'class-validator';
import { CreateInsuranceClaimDto, ClaimStatus } from './create-insurance-claim.dto';

export class UpdateInsuranceClaimDto extends PartialType(CreateInsuranceClaimDto) {
  @IsOptional()
  @IsEnum(ClaimStatus)
  status?: ClaimStatus;

  @IsOptional()
  @IsNumber()
  approvedAmount?: number;

  @IsOptional()
  @IsNumber()
  rejectedAmount?: number;

  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @IsOptional()
  @IsDateString()
  reviewedDate?: string;

  @IsOptional()
  @IsString()
  reviewedBy?: string;

  @IsOptional()
  @IsString()
  tpaReferenceNumber?: string;

  @IsOptional()
  @IsString()
  settlementNumber?: string;

  @IsOptional()
  @IsDateString()
  settlementDate?: string;

  @IsOptional()
  @IsNumber()
  settlementAmount?: number;

  @IsOptional()
  @IsString()
  reviewRemarks?: string;

  @IsOptional()
  @IsString()
  preAuthStatus?: string;

  @IsOptional()
  @IsString()
  validityPeriod?: string;

  @IsOptional()
  @IsString()
  conditions?: string;
}