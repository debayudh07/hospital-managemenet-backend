import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNotEmpty,
  IsPhoneNumber,
  IsEmail,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  AdmissionType,
  Gender,
} from '@prisma/client';

// Reuse patient DTO from OPD
export class CreatePatientDto {
  @ApiProperty({ description: 'Patient first name' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'Patient last name' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiPropertyOptional({ description: 'Patient email' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'Patient phone number' })
  @IsPhoneNumber('IN')
  phone: string;

  @ApiProperty({ description: 'Date of birth' })
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty({ enum: Gender, description: 'Patient gender' })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({ description: 'Patient address' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiPropertyOptional({ description: 'City' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ description: 'State' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({ description: 'ZIP code' })
  @IsString()
  @IsOptional()
  zipCode?: string;

  @ApiPropertyOptional({ description: 'Emergency contact name' })
  @IsString()
  @IsOptional()
  emergencyContactName?: string;

  @ApiPropertyOptional({ description: 'Emergency contact phone' })
  @IsString()
  @IsOptional()
  emergencyContactPhone?: string;

  @ApiPropertyOptional({ description: 'Emergency contact relationship' })
  @IsString()
  @IsOptional()
  emergencyContactRelationship?: string;

  @ApiPropertyOptional({ description: 'Blood group' })
  @IsString()
  @IsOptional()
  bloodGroup?: string;

  @ApiPropertyOptional({ description: 'Known allergies' })
  @IsString()
  @IsOptional()
  allergies?: string;

  @ApiPropertyOptional({ description: 'Chronic conditions' })
  @IsString()
  @IsOptional()
  chronicConditions?: string;

  @ApiPropertyOptional({ description: 'Current medications' })
  @IsString()
  @IsOptional()
  currentMedications?: string;

  @ApiPropertyOptional({ description: 'Insurance provider' })
  @IsString()
  @IsOptional()
  insuranceProvider?: string;

  @ApiPropertyOptional({ description: 'Insurance policy number' })
  @IsString()
  @IsOptional()
  insurancePolicyNumber?: string;
}

// DTO for IPD vitals
export class CreateIPDVitalsDto {
  @ApiPropertyOptional({ description: 'Blood pressure (e.g., 120/80)' })
  @IsString()
  @IsOptional()
  bloodPressure?: string;

  @ApiPropertyOptional({ description: 'Heart rate (bpm)' })
  @IsNumber()
  @IsOptional()
  heartRate?: number;

  @ApiPropertyOptional({ description: 'Temperature (°C)' })
  @IsNumber()
  @IsOptional()
  temperature?: number;

  @ApiPropertyOptional({ description: 'Respiratory rate (per minute)' })
  @IsNumber()
  @IsOptional()
  respiratoryRate?: number;

  @ApiPropertyOptional({ description: 'Oxygen saturation (%)' })
  @IsNumber()
  @IsOptional()
  oxygenSaturation?: number;

  @ApiPropertyOptional({ description: 'Weight (kg)' })
  @IsNumber()
  @IsOptional()
  weight?: number;

  @ApiPropertyOptional({ description: 'Height (cm)' })
  @IsNumber()
  @IsOptional()
  height?: number;

  @ApiPropertyOptional({ description: 'BMI' })
  @IsNumber()
  @IsOptional()
  bmi?: number;

  @ApiPropertyOptional({ description: 'Urine output (ml)' })
  @IsNumber()
  @IsOptional()
  urinOutput?: number;

  @ApiPropertyOptional({ description: 'Fluid intake (ml)' })
  @IsNumber()
  @IsOptional()
  fluidIntake?: number;

  @ApiPropertyOptional({ description: 'Pain scale (1-10)' })
  @IsNumber()
  @IsOptional()
  painScale?: number;

  @ApiPropertyOptional({ description: 'Shift (Morning/Evening/Night)' })
  @IsString()
  @IsOptional()
  shift?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}

// Main DTO for creating admission
export class CreateAdmissionDto {
  // Patient Info (for auto-creation if needed)
  @ApiPropertyOptional({ description: 'Existing patient ID' })
  @IsString()
  @IsOptional()
  patientId?: string;

  @ApiPropertyOptional({ type: CreatePatientDto, description: 'Patient data for auto-creation' })
  @ValidateNested()
  @Type(() => CreatePatientDto)
  @IsOptional()
  patientData?: CreatePatientDto;

  // Admission Info
  @ApiProperty({ description: 'Doctor ID' })
  @IsString()
  @IsNotEmpty()
  doctorId: string;

  @ApiProperty({ description: 'Bed ID' })
  @IsString()
  @IsNotEmpty()
  bedId: string;

  @ApiPropertyOptional({ description: 'Admission date' })
  @IsDateString()
  @IsOptional()
  admissionDate?: string;

  @ApiPropertyOptional({ description: 'Admission time' })
  @IsString()
  @IsOptional()
  admissionTime?: string;

  @ApiProperty({ enum: AdmissionType, description: 'Admission type' })
  @IsEnum(AdmissionType)
  admissionType: AdmissionType;

  @ApiPropertyOptional({ description: 'Admission category' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ description: 'Referral source' })
  @IsString()
  @IsOptional()
  referralSource?: string;

  @ApiPropertyOptional({ description: 'Referred by' })
  @IsString()
  @IsOptional()
  referredBy?: string;

  // Clinical Details
  @ApiProperty({ description: 'Chief complaint' })
  @IsString()
  @IsNotEmpty()
  chiefComplaint: string;

  @ApiPropertyOptional({ description: 'Present illness' })
  @IsString()
  @IsOptional()
  presentIllness?: string;

  @ApiPropertyOptional({ description: 'Past history' })
  @IsString()
  @IsOptional()
  pastHistory?: string;

  @ApiPropertyOptional({ description: 'Family history' })
  @IsString()
  @IsOptional()
  familyHistory?: string;

  @ApiPropertyOptional({ description: 'Personal history' })
  @IsString()
  @IsOptional()
  personalHistory?: string;

  @ApiPropertyOptional({ description: 'General condition' })
  @IsString()
  @IsOptional()
  generalCondition?: string;

  @ApiPropertyOptional({ description: 'Level of consciousness' })
  @IsString()
  @IsOptional()
  consciousness?: string;

  @ApiProperty({ description: 'Provisional diagnosis' })
  @IsString()
  @IsNotEmpty()
  provisionalDiagnosis: string;

  @ApiPropertyOptional({ description: 'Final diagnosis' })
  @IsString()
  @IsOptional()
  finalDiagnosis?: string;

  @ApiPropertyOptional({ description: 'Treatment plan' })
  @IsString()
  @IsOptional()
  treatmentPlan?: string;

  @ApiPropertyOptional({ description: 'Expected discharge date' })
  @IsDateString()
  @IsOptional()
  expectedDischargeDate?: string;

  // Financial
  @ApiPropertyOptional({ description: 'Estimated cost' })
  @IsNumber()
  @IsOptional()
  estimatedCost?: number;

  @ApiPropertyOptional({ description: 'Deposit amount' })
  @IsNumber()
  @IsOptional()
  depositAmount?: number;

  // Additional fields
  @ApiPropertyOptional({ description: 'Emergency contact' })
  @IsString()
  @IsOptional()
  emergencyContact?: string;

  @ApiPropertyOptional({ description: 'Insurance details' })
  @IsString()
  @IsOptional()
  insuranceDetails?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsString()
  @IsOptional()
  notes?: string;

  // Initial vitals
  @ApiPropertyOptional({ type: CreateIPDVitalsDto, description: 'Initial vitals data' })
  @ValidateNested()
  @Type(() => CreateIPDVitalsDto)
  @IsOptional()
  initialVitals?: CreateIPDVitalsDto;

  @ApiPropertyOptional({ description: 'Initial deposit' })
  @IsNumber()
  @IsOptional()
  initialDeposit?: number;
}