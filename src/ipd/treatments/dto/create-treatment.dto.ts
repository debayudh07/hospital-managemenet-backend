import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsDateString,
  IsNotEmpty,
  IsEnum,
} from 'class-validator';
import { TreatmentType } from '@prisma/client';

export class CreateTreatmentDto {
  @ApiProperty({ description: 'Admission ID for treatment' })
  @IsString()
  @IsNotEmpty()
  admissionId: string;

  @ApiProperty({ description: 'Doctor ID prescribing treatment' })
  @IsString()
  @IsNotEmpty()
  doctorId: string;

  @ApiProperty({ 
    enum: TreatmentType,
    description: 'Type of treatment' 
  })
  @IsEnum(TreatmentType)
  type: TreatmentType;

  @ApiProperty({ description: 'Treatment description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ description: 'Medication name (for medication treatments)' })
  @IsString()
  @IsOptional()
  medication?: string;

  @ApiPropertyOptional({ description: 'Dosage instructions (for medication treatments)' })
  @IsString()
  @IsOptional()
  dosage?: string;

  @ApiPropertyOptional({ description: 'Frequency of treatment/medication' })
  @IsString()
  @IsOptional()
  frequency?: string;

  @ApiPropertyOptional({ description: 'Route of administration (for medications)' })
  @IsString()
  @IsOptional()
  route?: string;

  @ApiPropertyOptional({ description: 'Treatment start date (defaults to current date)' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Treatment end date' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Additional treatment notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}