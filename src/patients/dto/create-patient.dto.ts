import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
  MinLength,
  IsPhoneNumber,
} from 'class-validator';
import { UserRole } from '@prisma/client';

export class CreatePatientDto {
  @ApiProperty({
    description: 'Patient email address',
    example: 'patient@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Patient password',
    example: 'securePassword123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Patient first name',
    example: 'John',
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    description: 'Patient last name',
    example: 'Doe',
  })
  @IsString()
  lastName: string;

  @ApiProperty({
    description: 'Patient phone number',
    example: '+1234567890',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'Patient address',
    example: '123 Main St, City, State',
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    description: 'Patient date of birth',
    example: '1990-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiProperty({
    description: 'Emergency contact name',
    example: 'Jane Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  emergencyContactName?: string;

  @ApiProperty({
    description: 'Emergency contact phone',
    example: '+1234567891',
    required: false,
  })
  @IsOptional()
  @IsString()
  emergencyContactPhone?: string;

  @ApiProperty({
    description: 'Medical history',
    example: 'No known allergies',
    required: false,
  })
  @IsOptional()
  @IsString()
  medicalHistory?: string;

  @ApiProperty({
    description: 'Current medications',
    example: 'Aspirin 81mg daily',
    required: false,
  })
  @IsOptional()
  @IsString()
  currentMedications?: string;

  @ApiProperty({
    description: 'Known allergies',
    example: 'Penicillin',
    required: false,
  })
  @IsOptional()
  @IsString()
  allergies?: string;

  @ApiProperty({
    description: 'Insurance provider',
    example: 'Blue Cross Blue Shield',
    required: false,
  })
  @IsOptional()
  @IsString()
  insuranceProvider?: string;

  @ApiProperty({
    description: 'Insurance policy number',
    example: 'BC123456789',
    required: false,
  })
  @IsOptional()
  @IsString()
  insurancePolicyNumber?: string;
}