import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppointmentType, AppointmentStatus } from '@prisma/client';

export class AppointmentResponseDto {
  @ApiProperty({ description: 'Appointment ID' })
  id: string;

  @ApiProperty({ description: 'Patient ID' })
  patientId: string;

  @ApiProperty({ description: 'Doctor ID' })
  doctorId: string;

  @ApiProperty({ description: 'Appointment date' })
  date: Date;

  @ApiProperty({ description: 'Start time' })
  startTime: string;

  @ApiProperty({ description: 'End time' })
  endTime: string;

  @ApiProperty({ description: 'Appointment type', enum: AppointmentType })
  type: AppointmentType;

  @ApiProperty({ description: 'Appointment status', enum: AppointmentStatus })
  status: AppointmentStatus;

  @ApiProperty({ description: 'Reason for appointment' })
  reason: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  notes?: string;

  @ApiProperty({ description: 'Created by user ID' })
  createdById: string;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;

  // Patient information
  @ApiPropertyOptional({ description: 'Patient name' })
  patientName?: string;

  @ApiPropertyOptional({ description: 'Patient email' })
  patientEmail?: string;

  @ApiPropertyOptional({ description: 'Patient phone' })
  patientPhone?: string;

  // Doctor information
  @ApiPropertyOptional({ description: 'Doctor name' })
  doctorName?: string;

  @ApiPropertyOptional({ description: 'Doctor specialization' })
  doctorSpecialization?: string;

  @ApiPropertyOptional({ description: 'Doctor consultation fee' })
  consultationFee?: number;
}