import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsBoolean,
  IsNotEmpty,
  IsPhoneNumber,
  IsEmail,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  VisitType,
  AppointmentMode,
  ReferralSource,
  VisitPriority,
  VisitStatus,
  Gender,
  PaymentMethod,
  MedicineRoute,
  PatientType,
  InvestigationType,
  InvestigationUrgency,
} from '@prisma/client';

// DTO for auto-creating patient if they don't exist
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

  @ApiPropertyOptional({ description: 'Guardian name' })
  @IsString()
  @IsOptional()
  guardianName?: string;

  @ApiPropertyOptional({ description: 'Guardian relation' })
  @IsString()
  @IsOptional()
  guardianRelation?: string;

  @ApiPropertyOptional({ description: 'Occupation' })
  @IsString()
  @IsOptional()
  occupation?: string;

  @ApiPropertyOptional({ description: 'ID proof type' })
  @IsString()
  @IsOptional()
  idProofType?: string;

  @ApiPropertyOptional({ description: 'ID proof number' })
  @IsString()
  @IsOptional()
  idProofNumber?: string;

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

// DTO for OPD vitals
export class CreateOPDVitalsDto {
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

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}

// DTO for OPD prescription
export class CreateOPDPrescriptionDto {
  @ApiProperty({ description: 'Drug name' })
  @IsString()
  @IsNotEmpty()
  drugName: string;

  @ApiPropertyOptional({ description: 'Drug strength' })
  @IsString()
  @IsOptional()
  strength?: string;

  @ApiProperty({ description: 'Dose (amount per intake)' })
  @IsString()
  @IsNotEmpty()
  dosage: string;

  @ApiProperty({ description: 'Frequency' })
  @IsString()
  @IsNotEmpty()
  frequency: string;

  @ApiProperty({ description: 'Duration' })
  @IsString()
  @IsNotEmpty()
  duration: string;

  @ApiPropertyOptional({ enum: MedicineRoute, description: 'Route of administration' })
  @IsEnum(MedicineRoute)
  @IsOptional()
  route?: MedicineRoute;

  @ApiPropertyOptional({ description: 'Quantity' })
  @IsNumber()
  @IsOptional()
  quantity?: number;

  @ApiPropertyOptional({ description: 'Special instructions' })
  @IsString()
  @IsOptional()
  instructions?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'Is generic medicine' })
  @IsBoolean()
  @IsOptional()
  isGeneric?: boolean;
}

// DTO for OPD investigation
export class CreateOPDInvestigationDto {
  @ApiProperty({ description: 'Test/Investigation name' })
  @IsString()
  @IsNotEmpty()
  testName: string;

  @ApiPropertyOptional({ enum: InvestigationType, description: 'Test type (LAB/RADIOLOGY/OTHER)' })
  @IsEnum(InvestigationType)
  @IsOptional()
  testType?: InvestigationType;

  @ApiPropertyOptional({ enum: InvestigationUrgency, description: 'Urgency level' })
  @IsEnum(InvestigationUrgency)
  @IsOptional()
  urgency?: InvestigationUrgency;

  @ApiPropertyOptional({ description: 'Special instructions' })
  @IsString()
  @IsOptional()
  instructions?: string;
}

// DTO for OPD billing
export class CreateOPDBillingDto {
  @ApiProperty({ description: 'Consultation fee' })
  @IsNumber()
  consultationFee: number;

  @ApiPropertyOptional({ description: 'Additional charges' })
  @IsNumber()
  @IsOptional()
  additionalCharges?: number;

  @ApiPropertyOptional({ description: 'Discount amount' })
  @IsNumber()
  @IsOptional()
  discount?: number;

  @ApiPropertyOptional({ description: 'Tax amount' })
  @IsNumber()
  @IsOptional()
  tax?: number;

  @ApiPropertyOptional({ enum: PaymentMethod, description: 'Payment method' })
  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({ description: 'Amount paid' })
  @IsNumber()
  @IsOptional()
  paidAmount?: number;

  @ApiPropertyOptional({ description: 'Transaction ID' })
  @IsString()
  @IsOptional()
  transactionId?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}

// Main DTO for creating OPD visit
export class CreateOPDVisitDto {
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

  // Visit Info
  @ApiProperty({ description: 'Doctor ID' })
  @IsString()
  @IsNotEmpty()
  doctorId: string;

  @ApiProperty({ description: 'Department ID' })
  @IsString()
  @IsNotEmpty()
  departmentId: string;

  @ApiPropertyOptional({ description: 'Visit date' })
  @IsDateString()
  @IsOptional()
  visitDate?: string;

  @ApiPropertyOptional({ description: 'Visit time' })
  @IsString()
  @IsOptional()
  visitTime?: string;

  @ApiPropertyOptional({ enum: VisitType, description: 'Visit type' })
  @IsEnum(VisitType)
  @IsOptional()
  visitType?: VisitType;

  @ApiPropertyOptional({ enum: AppointmentMode, description: 'Appointment mode' })
  @IsEnum(AppointmentMode)
  @IsOptional()
  appointmentMode?: AppointmentMode;

  @ApiPropertyOptional({ enum: ReferralSource, description: 'Referral source' })
  @IsEnum(ReferralSource)
  @IsOptional()
  referralSource?: ReferralSource;

  @ApiPropertyOptional({ description: 'Referred by (if applicable)' })
  @IsString()
  @IsOptional()
  referredBy?: string;

  @ApiPropertyOptional({ enum: VisitPriority, description: 'Visit priority' })
  @IsEnum(VisitPriority)
  @IsOptional()
  priority?: VisitPriority;

  @ApiPropertyOptional({ enum: VisitStatus, description: 'Visit status' })
  @IsEnum(VisitStatus)
  @IsOptional()
  status?: VisitStatus;

  // Clinical Info
  @ApiProperty({ description: 'Chief complaint' })
  @IsString()
  @IsNotEmpty()
  chiefComplaint: string;

  @ApiPropertyOptional({ description: 'History of present illness' })
  @IsString()
  @IsOptional()
  historyOfPresentIllness?: string;

  @ApiPropertyOptional({ description: 'Past medical history' })
  @IsString()
  @IsOptional()
  pastMedicalHistory?: string;

  @ApiPropertyOptional({ description: 'Family history' })
  @IsString()
  @IsOptional()
  familyHistory?: string;

  @ApiPropertyOptional({ description: 'Social history' })
  @IsString()
  @IsOptional()
  socialHistory?: string;

  @ApiPropertyOptional({ description: 'General examination' })
  @IsString()
  @IsOptional()
  generalExamination?: string;

  @ApiPropertyOptional({ description: 'Systemic examination' })
  @IsString()
  @IsOptional()
  systemicExamination?: string;

  @ApiPropertyOptional({ description: 'Provisional diagnosis' })
  @IsString()
  @IsOptional()
  provisionalDiagnosis?: string;

  @ApiPropertyOptional({ description: 'Final diagnosis' })
  @IsString()
  @IsOptional()
  finalDiagnosis?: string;

  @ApiPropertyOptional({ description: 'Treatment plan' })
  @IsString()
  @IsOptional()
  treatmentPlan?: string;

  @ApiPropertyOptional({ description: 'Follow-up date' })
  @IsDateString()
  @IsOptional()
  followUpDate?: string;

  @ApiPropertyOptional({ description: 'Follow-up instructions' })
  @IsString()
  @IsOptional()
  followUpInstructions?: string;

  @ApiPropertyOptional({ description: 'Investigation recommendations' })
  @IsString()
  @IsOptional()
  investigationRecommendations?: string;

  @ApiPropertyOptional({ description: 'Symptoms' })
  @IsString()
  @IsOptional()
  symptoms?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'Is this a follow-up visit' })
  @IsBoolean()
  @IsOptional()
  isFollowUp?: boolean;

  @ApiPropertyOptional({ description: 'Parent visit ID for follow-ups' })
  @IsString()
  @IsOptional()
  parentVisitId?: string;

  // Nested DTOs
  @ApiPropertyOptional({ type: CreateOPDVitalsDto, description: 'Vitals data' })
  @ValidateNested()
  @Type(() => CreateOPDVitalsDto)
  @IsOptional()
  vitals?: CreateOPDVitalsDto;

  @ApiPropertyOptional({ type: [CreateOPDPrescriptionDto], description: 'Prescriptions data' })
  @ValidateNested({ each: true })
  @Type(() => CreateOPDPrescriptionDto)
  @IsOptional()
  prescriptions?: CreateOPDPrescriptionDto[];

  @ApiPropertyOptional({ type: [CreateOPDInvestigationDto], description: 'Investigations data' })
  @ValidateNested({ each: true })
  @Type(() => CreateOPDInvestigationDto)
  @IsOptional()
  investigations?: CreateOPDInvestigationDto[];

  @ApiProperty({ type: CreateOPDBillingDto, description: 'Billing data' })
  @ValidateNested()
  @Type(() => CreateOPDBillingDto)
  billing: CreateOPDBillingDto;
}