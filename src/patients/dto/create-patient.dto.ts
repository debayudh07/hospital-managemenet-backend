import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
  MinLength,
} from 'class-validator';
import { Gender } from '@prisma/client';

export class CreatePatientDto {
  @ApiProperty({
    description: 'Patient email address',
    example: 'patient@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Patient password (optional)',
    example: 'securePassword123',
    minLength: 6,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

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
    description: 'Patient date of birth',
    example: '1990-01-01',
  })
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty({
    description: 'Patient gender',
    enum: Gender,
    example: 'MALE',
  })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({
    description: 'Patient phone number',
    example: '+1234567890',
  })
  @IsString()
  phone: string;

  @ApiProperty({
    description: 'Patient address',
    example: '123 Main St',
  })
  @IsString()
  address: string;

  @ApiProperty({
    description: 'Patient city',
    example: 'New York',
  })
  @IsString()
  city: string;

  @ApiProperty({
    description: 'Patient state',
    example: 'NY',
  })
  @IsString()
  state: string;

  @ApiProperty({
    description: 'Patient zip code',
    example: '10001',
  })
  @IsString()
  zipCode: string;

  @ApiProperty({
    description: 'Emergency contact name',
    example: 'Jane Doe',
  })
  @IsString()
  emergencyContactName: string;

  @ApiProperty({
    description: 'Emergency contact phone',
    example: '+1234567891',
  })
  @IsString()
  emergencyContactPhone: string;

  @ApiProperty({
    description: 'Emergency contact relationship',
    example: 'Spouse',
  })
  @IsString()
  emergencyContactRelationship: string;

  @ApiProperty({
    description: 'Blood group',
    example: 'A+',
    required: false,
  })
  @IsOptional()
  @IsString()
  bloodGroup?: string;

  @ApiProperty({
    description: 'Known allergies',
    example: 'Penicillin',
    required: false,
  })
  @IsOptional()
  @IsString()
  allergies?: string;

  @ApiProperty({
    description: 'Chronic conditions',
    example: 'Diabetes, Hypertension',
    required: false,
  })
  @IsOptional()
  @IsString()
  chronicConditions?: string;

  @ApiProperty({
    description: 'Current medications',
    example: 'Aspirin 81mg daily',
    required: false,
  })
  @IsOptional()
  @IsString()
  currentMedications?: string;

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
