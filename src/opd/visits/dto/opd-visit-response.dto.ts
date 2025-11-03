import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  VisitType,
  AppointmentMode,
  ReferralSource,
  VisitPriority,
  VisitStatus,
  Gender,
} from '@prisma/client';

export class PatientResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  patientId: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiPropertyOptional()
  email?: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  dateOfBirth: Date;

  @ApiProperty({ enum: Gender })
  gender: Gender;

  @ApiProperty()
  address: string;

  @ApiPropertyOptional()
  city?: string;

  @ApiPropertyOptional()
  state?: string;

  @ApiPropertyOptional()
  zipCode?: string;

  @ApiPropertyOptional()
  bloodGroup?: string;

  @ApiPropertyOptional()
  allergies?: string;

  @ApiPropertyOptional()
  chronicConditions?: string;
}

export class DoctorResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  doctorId: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  specialization: string;

  @ApiProperty()
  consultationFee: number;
}

export class DepartmentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;
}

export class OPDVitalsResponseDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional()
  bloodPressure?: string;

  @ApiPropertyOptional()
  heartRate?: number;

  @ApiPropertyOptional()
  temperature?: number;

  @ApiPropertyOptional()
  respiratoryRate?: number;

  @ApiPropertyOptional()
  oxygenSaturation?: number;

  @ApiPropertyOptional()
  weight?: number;

  @ApiPropertyOptional()
  height?: number;

  @ApiPropertyOptional()
  bmi?: number;

  @ApiProperty()
  recordedAt: Date;

  @ApiProperty()
  recordedBy: string;

  @ApiPropertyOptional()
  notes?: string;
}

export class OPDPrescriptionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  medicineName: string;

  @ApiProperty()
  dosage: string;

  @ApiProperty()
  frequency: string;

  @ApiProperty()
  duration: string;

  @ApiPropertyOptional()
  quantity?: number;

  @ApiPropertyOptional()
  instructions?: string;

  @ApiProperty()
  isGeneric: boolean;

  @ApiProperty()
  createdAt: Date;
}

export class OPDBillingResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  consultationFee: number;

  @ApiProperty()
  additionalCharges: number;

  @ApiProperty()
  discount: number;

  @ApiProperty()
  tax: number;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  paymentStatus: string;

  @ApiPropertyOptional()
  paymentMethod?: string;

  @ApiProperty()
  paidAmount: number;

  @ApiProperty()
  balanceAmount: number;

  @ApiPropertyOptional()
  transactionId?: string;

  @ApiPropertyOptional()
  paymentDate?: Date;

  @ApiPropertyOptional()
  notes?: string;
}

export class OPDVisitResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  visitId: string;

  @ApiProperty()
  patientId: string;

  @ApiProperty()
  doctorId: string;

  @ApiProperty()
  departmentId: string;

  @ApiProperty()
  visitDate: Date;

  @ApiProperty()
  visitTime: string;

  @ApiProperty({ enum: VisitType })
  visitType: VisitType;

  @ApiProperty({ enum: AppointmentMode })
  appointmentMode: AppointmentMode;

  @ApiProperty({ enum: ReferralSource })
  referralSource: ReferralSource;

  @ApiPropertyOptional()
  referredBy?: string;

  @ApiProperty({ enum: VisitPriority })
  priority: VisitPriority;

  @ApiProperty({ enum: VisitStatus })
  status: VisitStatus;

  @ApiProperty()
  chiefComplaint: string;

  @ApiPropertyOptional()
  historyOfPresentIllness?: string;

  @ApiPropertyOptional()
  pastMedicalHistory?: string;

  @ApiPropertyOptional()
  familyHistory?: string;

  @ApiPropertyOptional()
  socialHistory?: string;

  @ApiPropertyOptional()
  generalExamination?: string;

  @ApiPropertyOptional()
  systemicExamination?: string;

  @ApiPropertyOptional()
  provisionalDiagnosis?: string;

  @ApiPropertyOptional()
  finalDiagnosis?: string;

  @ApiPropertyOptional()
  treatmentPlan?: string;

  @ApiPropertyOptional()
  followUpDate?: Date;

  @ApiPropertyOptional()
  followUpInstructions?: string;

  @ApiPropertyOptional()
  investigationRecommendations?: string;

  @ApiPropertyOptional()
  symptoms?: string;

  @ApiPropertyOptional()
  notes?: string;

  @ApiProperty()
  isFollowUp: boolean;

  @ApiPropertyOptional()
  parentVisitId?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  // Relations
  @ApiProperty({ type: PatientResponseDto })
  patient: PatientResponseDto;

  @ApiProperty({ type: DoctorResponseDto })
  doctor: DoctorResponseDto;

  @ApiProperty({ type: DepartmentResponseDto })
  department: DepartmentResponseDto;

  @ApiPropertyOptional({ type: [OPDVitalsResponseDto] })
  vitals?: OPDVitalsResponseDto[];

  @ApiPropertyOptional({ type: [OPDPrescriptionResponseDto] })
  prescriptions?: OPDPrescriptionResponseDto[];

  @ApiPropertyOptional({ type: OPDBillingResponseDto })
  billing?: OPDBillingResponseDto;
}