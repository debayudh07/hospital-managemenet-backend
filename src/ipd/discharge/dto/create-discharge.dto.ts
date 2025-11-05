import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsDateString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class DischargeMedicationDto {
  @ApiProperty({ description: 'Medicine name' })
  @IsString()
  @IsNotEmpty()
  medicineName: string;

  @ApiProperty({ description: 'Dosage instructions' })
  @IsString()
  @IsNotEmpty()
  dosage: string;

  @ApiProperty({ description: 'Frequency of medication' })
  @IsString()
  @IsNotEmpty()
  frequency: string;

  @ApiProperty({ description: 'Duration of medication' })
  @IsString()
  @IsNotEmpty()
  duration: string;

  @ApiPropertyOptional({ description: 'Special instructions' })
  @IsString()
  @IsOptional()
  instructions?: string;
}

export class CreateDischargeDto {
  @ApiProperty({ description: 'Admission ID to discharge' })
  @IsString()
  @IsNotEmpty()
  admissionId: string;

  @ApiProperty({ description: 'Doctor ID performing discharge' })
  @IsString()
  @IsNotEmpty()
  doctorId: string;

  @ApiPropertyOptional({ description: 'Discharge date (defaults to current date)' })
  @IsDateString()
  @IsOptional()
  dischargeDate?: string;

  @ApiPropertyOptional({ description: 'Discharge time (defaults to current time)' })
  @IsString()
  @IsOptional()
  dischargeTime?: string;

  @ApiPropertyOptional({ description: 'Type of discharge (Normal, LAMA, Death, etc.)' })
  @IsString()
  @IsOptional()
  dischargeType?: string;

  @ApiProperty({ description: 'Final diagnosis at discharge' })
  @IsString()
  @MinLength(10)
  finalDiagnosis: string;

  @ApiPropertyOptional({ description: 'Treatment summary during admission' })
  @IsString()
  @IsOptional()
  treatmentSummary?: string;

  @ApiPropertyOptional({ description: 'Patient condition at discharge' })
  @IsString()
  @IsOptional()
  conditionAtDischarge?: string;

  @ApiPropertyOptional({ description: 'Follow-up care instructions' })
  @IsString()
  @IsOptional()
  followUpInstructions?: string;

  @ApiPropertyOptional({ description: 'Next follow-up appointment date' })
  @IsDateString()
  @IsOptional()
  followUpDate?: string;

  @ApiPropertyOptional({ description: 'Activity restrictions for patient' })
  @IsString()
  @IsOptional()
  restrictions?: string;

  @ApiPropertyOptional({ description: 'Additional discharge notes' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ 
    description: 'Discharge medications',
    type: [DischargeMedicationDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DischargeMedicationDto)
  @IsOptional()
  medications?: DischargeMedicationDto[];
}