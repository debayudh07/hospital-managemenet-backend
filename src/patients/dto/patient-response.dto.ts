import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class PatientResponseDto {
  @ApiProperty({
    description: 'Patient ID',
    example: 'clxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  })
  id: string;

  @ApiProperty({
    description: 'Patient email address',
    example: 'patient@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Patient first name',
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: 'Patient last name',
    example: 'Doe',
  })
  lastName: string;

  @ApiProperty({
    description: 'User role',
    enum: UserRole,
    example: UserRole.PATIENT,
  })
  role: UserRole;

  @ApiProperty({
    description: 'Patient phone number',
    example: '+1234567890',
    required: false,
    nullable: true,
  })
  phone?: string | null;

  @ApiProperty({
    description: 'Patient address',
    example: '123 Main St, City, State',
    required: false,
    nullable: true,
  })
  address?: string | null;

  @ApiProperty({
    description: 'Patient date of birth',
    example: '1990-01-01T00:00:00.000Z',
    required: false,
    nullable: true,
  })
  dateOfBirth?: Date | null;

  @ApiProperty({
    description: 'Patient avatar URL',
    example: 'https://example.com/avatar.jpg',
    required: false,
    nullable: true,
  })
  avatar?: string | null;

  @ApiProperty({
    description: 'Whether the patient account is active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Emergency contact name',
    example: 'Jane Doe',
    required: false,
    nullable: true,
  })
  emergencyContactName?: string | null;

  @ApiProperty({
    description: 'Emergency contact phone',
    example: '+1234567891',
    required: false,
    nullable: true,
  })
  emergencyContactPhone?: string | null;

  @ApiProperty({
    description: 'Emergency contact relationship',
    example: 'Spouse',
    required: false,
    nullable: true,
  })
  emergencyContactRelationship?: string | null;

  @ApiProperty({
    description: 'Patient city',
    example: 'New York',
    required: false,
    nullable: true,
  })
  city?: string | null;

  @ApiProperty({
    description: 'Patient state',
    example: 'NY',
    required: false,
    nullable: true,
  })
  state?: string | null;

  @ApiProperty({
    description: 'Patient zip code',
    example: '10001',
    required: false,
    nullable: true,
  })
  zipCode?: string | null;

  @ApiProperty({
    description: 'Patient gender',
    example: 'MALE',
    required: false,
    nullable: true,
  })
  gender?: string | null;

  @ApiProperty({
    description: 'Blood group',
    example: 'A+',
    required: false,
    nullable: true,
  })
  bloodGroup?: string | null;

  @ApiProperty({
    description: 'Chronic conditions',
    example: 'Diabetes, Hypertension',
    required: false,
    nullable: true,
  })
  chronicConditions?: string | null;

  @ApiProperty({
    description: 'Current medications',
    example: 'Aspirin 81mg daily',
    required: false,
    nullable: true,
  })
  currentMedications?: string | null;

  @ApiProperty({
    description: 'Known allergies',
    example: 'Penicillin',
    required: false,
    nullable: true,
  })
  allergies?: string | null;

  @ApiProperty({
    description: 'Medical history',
    example: 'Previous surgeries, medical conditions',
    required: false,
    nullable: true,
  })
  medicalHistory?: string | null;

  @ApiProperty({
    description: 'Insurance provider',
    example: 'Blue Cross Blue Shield',
    required: false,
    nullable: true,
  })
  insuranceProvider?: string | null;

  @ApiProperty({
    description: 'Insurance policy number',
    example: 'BC123456789',
    required: false,
    nullable: true,
  })
  insurancePolicyNumber?: string | null;

  @ApiProperty({
    description: 'Account creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}
